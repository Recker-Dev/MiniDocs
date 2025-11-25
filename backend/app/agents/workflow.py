from dotenv import load_dotenv
import os
load_dotenv()

from typing import TypedDict, List, Dict, Optional, Union, Literal
from pydantic import BaseModel

################### BASE CLASSES #########################
# ------------------------------------------------------ #

### SUPERVISOR STATE ###
class SupervisorState(BaseModel):
    trigger_action: str

### USER STATE ###
class SectionConfig(BaseModel):
    section_name: str
    description: str

class UserState(BaseModel):
    main_topic: str
    sections: List[SectionConfig]
    constraints: str
    dynamic_generation: bool
    context: str   

### GENERATED CONTENT STATE ###
class GeneratedConfig(BaseModel):
    section_name: str
    content: str

class GeneratedState(BaseModel):
    generated_content : List[GeneratedConfig]
    
### EVALUATOR STATE ####
class SemanticChangeConfig(BaseModel):
    section_name: str
    issue: str
    suggestion: str

class StructuralChangeConfig(BaseModel):
    action: Literal["add", "remove", "rename", "reorder"]
    section_name: str
    context: str

class EvaluatorState(BaseModel):
    coherency_score: float

    # Problems with wording, clarity, logic, tone, alignment
    semantic_issues: Union[
        Literal["None"],
        List[SemanticChangeConfig]
    ]

    # High-level structural changes: add/remove/reorder sections
    structural_changes: Union[
        Literal["None"],
        List[StructuralChangeConfig]
    ]

    # Helps supervisor pick refine path
    next_action: Literal[
        "semantic_refine",
        "structural_refine",
        "no_action"
    ]

    # Brief evaluator thoughts (allowed ALWAYS)
    evaluator_diagnostic_summary: str


################### SYSTEM PROMPTS #########################
# ------------------------------------------------------ #


from langchain_core.prompts import ChatPromptTemplate

full_gen_prompt = ChatPromptTemplate.from_template("""
You are an expert content generation model. Your job is to generate high-quality, coherent text for each given section of a document based on the user configuration.

Below is the information provided by the user. Use ALL of it carefully.

=========================
        USER CONFIG
=========================

{USER_CONFIG}

=========================
       INSTRUCTIONS
=========================

1. Generate **clear, structured, coherent text** for each section.
2. Each section must have a final output in this format:
   - "name": <section name>
   - "text": <generated text>
3. Respect ALL constraints strictly (tone, style, transformation rules, etc.).
4. Only generate content for the sections. Do NOT invent extra topics.
5. Ensure continuity and coherence across all sections.
6. Use mordern markdown format if needed.
7. Your final output MUST be valid JSON in this structure:
  
{{
  "generated_content": [
    {{ "section_name": "...", "content": "..." }},
  ]
}}

Return parseable JSON only, with no commentary.
""")


evaluator_prompt = ChatPromptTemplate.from_template("""
Your role is to act as a strict, high-signal evaluator of the generated document.  
You must determine whether the content is acceptable as-is, or if it requires:
1. Semantic refinements  
2. Structural modifications  
3. No changes  

Your evaluation determines which refinement node the system executes next.

ONLY report issues that meaningfully affect understanding, correctness, coherence, structure, or alignment with user constraints.  
Ignore trivial or cosmetic matters.

========================================================
                 USER OBJECTIVES
========================================================

{USER_CONFIG}

ALLOW_DYNAMIC_CONTENT_GENERATION = {ALLOW_DYNAMIC_CONTENT_GENERATION}

========================================================
           GENERATED CONTENT TO EVALUATE
========================================================
{GENERATED_CONTENT}

========================================================
           EVALUATION INSTRUCTIONS
========================================================

You will evaluate the content on TWO independent axes:
semantic quality and structural quality.

--------------------------------------------------------
1. SEMANTIC QUALITY (Meaning, clarity, correctness)
--------------------------------------------------------
Identify semantic issues ONLY if they meaningfully harm:

- clarity or understanding  
- coherence or logical flow  
- correctness or internal consistency  
- alignment with topic  
- adherence to constraints in a non-trivial way  

For each semantic issue:
Return a SemanticChangeConfig object:
- section_name  
- issue  
- suggestion (clear, actionable, non-trivial improvement)

If there are NO meaningful semantic issues, return "None".

--------------------------------------------------------
2. STRUCTURAL QUALITY (Sections, ordering, presence)
--------------------------------------------------------
Evaluate whether the structure is logically sound AND aligned with the intended outline.

You must evaluate structure differently depending on ALLOW_DYNAMIC_CONTENT_GENERATION:

--------------------------------------------------------
A. RIGID MODE (ALLOW_DYNAMIC_CONTENT_GENERATION = "false")
--------------------------------------------------------
- You MUST NOT propose structural actions (add/remove/reorder/rename).
- You MUST NOT propose creative section names or re-frame the outline.
- You MAY diagnose structural issues, but ONLY inside evaluator_diagnostic_summary.
- The model in refinement steps MUST strictly follow the user's provided section list.
- structural_changes MUST be "None".

This mode is for users who want *strict adherence* to the provided structure.

--------------------------------------------------------
B. FLEXIBLE MODE (ALLOW_DYNAMIC_CONTENT_GENERATION = "true")
--------------------------------------------------------
The evaluator is permitted to make **controlled creative suggestions** IF they help clarity, structure, or alignment with constraints.

Allowed creativity:
- Propose new sections when meaningfully valuable  
- Suggest renaming sections for stronger clarity or alignment  
- Suggest reordering for better narrative flow  
- Suggest merging or splitting sections  
- Suggest more expressive or more natural hierarchical organization  

BUT all creativity must obey:
1. Do NOT contradict user constraints  
2. Do NOT violate topic, tone, or mandatory elements  
3. Do NOT overwrite user-intended meaning  
4. Creativity must be purposeful, not decorative  

This mode is for users who want guided, intelligent expansion.

If no structural modifications are required, return "None".

--------------------------------------------------------
3. DECIDE next_action
--------------------------------------------------------

Return exactly ONE of:

- "structural_refine"  
      → if structural_changes list is NOT "None"

- "semantic_refine"  
      → if structural_changes = "None" AND semantic_issues list is NOT "None"

- "no_action"  
      → if BOTH semantic_issues and structural_changes are "None"

--------------------------------------------------------
4. EVALUATOR DIAGNOSTIC SUMMARY (User-facing only)
--------------------------------------------------------
Provide a 2–4 sentence expert summary of:
- overall quality  
- useful high-level insights  
- potential conceptual improvements  
- structural opportunities (even in rigid mode)  

This field is **ALWAYS allowed**, regardless of dynamic mode.

IMPORTANT:
- This summary is for the USER, not for the system.
- It must NOT influence routing logic (that is handled by next_action).
- Do NOT include actionable suggestions here — only insights.

--------------------------------------------------------
5. COHERENCY SCORE
--------------------------------------------------------
Provide a coherency score (0–1) based on:
- overall logical clarity  
- organization  
- semantic cohesion  
- conceptual soundness  

This score is INDEPENDENT of refinement rules or dynamic mode.

========================================================
              OUTPUT JSON FORMAT (STRICT)
========================================================

Return ONLY a JSON object matching EXACTLY this schema:

{{
  {{"coherency_score": <float 0–1>,}}
  {{"overall_pass": <true/false>,}}

  {{"semantic_issues": "None" OR [
     {{
       "section_name": "...",
       "issue": "...",
       "suggestion": "..."
     }}
  ],}}

  {{"structural_changes": "None" OR [
     {{
       "action": "add" | "remove" | "rename" | "reorder",
       "section_name": "...",
       "context": "..."
     }}
  ],}}

  {{"next_action": "semantic_refine" | "structural_refine" | "no_action",}}

  {{"evaluator_diagnostic_summary": "..."}}
}}

Return parseable JSON only, with no commentary.
""")



semantic_refine_prompt = ChatPromptTemplate.from_template("""
You are an expert rewriting and refinement model. Your job is to improve the already generated document sections **only where required**, based on evaluator feedback.

=========================
        USER CONFIG
=========================

{USER_CONFIG}

=========================
    ORIGINAL GENERATED CONTENT
=========================
{GENERATED_CONTENT}

=========================
     SEMANTIC FEEDBACK
=========================

{SEMANTIC_FEEDBACK}

=========================
        INSTRUCTIONS
=========================

1. **Refine ONLY the sections the evaluator marked as problematic.**
2. When refining:
   - Fix coherence issues
   - Follow evaluator's suggestions precisely
   - Follow all original constraints (tone, style, length rules)
3. Preserve the section names. Only update the text.
4. For sections with *no issues*, return the existing text unchanged.
5. Use mordern markdown format if needed.
6. You MUST output valid JSON in the following exact format:

{{
  "generated_content": [
    {{ "section_name": "...", "content": "..." }},
  ]
}}

Return parseable JSON only, with no commentary.
""")


structural_refine_prompt = ChatPromptTemplate.from_template("""
You are a structural refinement model. Your job is to update the
document’s SECTION OUTLINE and CONTENT according to evaluator
structural feedback.

You MUST follow the evaluator’s structural_changes exactly.

=========================
        USER CONFIG
=========================

{USER_CONFIG}

=========================
     ORIGINAL CONTENT
=========================
{GENERATED_CONTENT}

=========================
   STRUCTURAL FEEDBACK
=========================
{STRUCTURAL_FEEDBACK}

=========================
        INSTRUCTIONS
=========================

Your tasks:

1. Apply each structural change in order:
   - Add new section(s) (generate content following constraints)
   - Remove sections
   - Rename sections
   - Reorder sections

2. After structural operations, regenerate ONLY what changed.
   Unchanged sections must stay exactly the same.

3. Follow all original constraints (tone, length, style).

4. Use mordern markdown format if needed.

Return JSON in the following exact format:

{{
  "generated_content": [
     {{ "section_name": "...", "content": "..." }},
     {{ "section_name": "...", "content": "..." }}
  ]
}}

Return parseable JSON only, with no commentary.
""")

################### HELPER FUNCTIONS #########################
# ------------------------------------------------------ #


def format_user_config(usr_inp):
    lines =[]
    lines.append(f"\n## Main Topic: {usr_inp['main_topic']}.")

    if usr_inp.get('sections'):
        lines.append("## User Defined Sample Sections: ")
        sections = usr_inp["sections"]
        for i,sec in enumerate(sections, start = 1 ):
            lines.append(f"{i}. {sec['section_name']} : \n - {sec['description']}")

    if usr_inp.get('expected_sections_count'):
        lines.append(f"## Number of Sections User Expects: {usr_inp['expected_sections_count']}")

    lines.append(f"## User defined CONSTRAINTS: {usr_inp.get('constraints',"None")}")
    lines.append(f"## Additional User Context: {usr_inp.get('context',"None")}")

    return "\n\n".join(lines)

# def format_sections(sections):
#     lines =[]
#     for i,sec in enumerate(sections, start = 1 ):
#         lines.append(f"{i}. {sec["section_name"]} -> {sec["description"]}")

#     return "\n".join(lines)

def format_generated_content(content):
    lines =[]
    for i,sec in enumerate(content, start = 1 ):
        lines.append(f"{i}. {sec["section_name"]} : \n - {sec["content"]}")

    return "\n\n".join(lines)

def format_evaluation(evaluator_state):

    lines = []
    lines.append(f"### Evaluation Result ###")
    lines.append(f"- Overall Coherency Score: {evaluator_state['coherency_score']}")

    # 1. STRUCTURAL CHANGES (Highest Priority)
    structural = evaluator_state["structural_changes"]
    if isinstance(structural, list) and len(structural) > 0:
        lines.append("\n## Structural Changes Required ##\n")
        for i, change in enumerate(structural, start=1):
            lines.append(
                f"{i}. Action: **{change['action']}**\n"
                f"   - Section: {change['section_name']}\n"
                f"   - Context: {change['context']}"
            )
        return "\n".join(lines)
    else:
        lines.append("\n- No structural issues.")

    # 2. SEMANTIC ISSUES (Only if no structural)
    semantic = evaluator_state["semantic_issues"]
    if isinstance(semantic, list) and len(semantic) > 0:
        lines.append("\n## Semantic Refinements Required ##\n")
        for i, issue in enumerate(semantic, start=1):
            lines.append(
                f"{i}. Section: **{issue['section_name']}**\n"
                f"   - Issue: {issue['issue']}\n"
                f"   - Suggestion: {issue['suggestion']}"
            )
    else:
        lines.append("\n- No semantic issues.")


    # If neither structural nor semantic — next_action = no_action
    return "\n".join(lines)

################### LANG-GRAPH LOGIC #########################
# ------------------------------------------------------ #

from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END, START
import json

  
class GraphState(TypedDict):
    # ===== USER STATE =======
    supervisor_state: SupervisorState
    user_state: UserState
    generated_state: GeneratedState
    evaluator_state: EvaluatorState
    iteration: int
    evaluator_history: List[dict] = []
    
    

# Create nodes (functions)
def generate_initial_draft(state: GraphState) -> GraphState:
    print("\n" + "="*60)
    print("---GENERATE INITIAL DRAFT NODE---")
    print("="*60 + "\n")
    
    llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    response_schema=GeneratedState.model_json_schema(),  
    response_mime_type = 'application/json',
)
    # Extract user state
    user_state = state["user_state"]
    
    # Format the user fields as required
    formatted_user_config = format_user_config(user_state)

    # Prepare the input for the prompt
    prompt_load = {
        "USER_CONFIG": formatted_user_config,
    }

    # Format the prompt using the template
    prompt = full_gen_prompt.format(**prompt_load)
    
    # Invoke the LLM with the formatted prompt
    response = llm.invoke(prompt)
    
    # Assuming the response is what you want
    return {"generated_state":json.loads(response.content)}


def evaluator(state: GraphState) -> GraphState:
    """ Evaluates the generated content """
    print("\n" + "="*60)
    print("---EVALUATOR NODE---")
    print("="*60 + "\n")
          
    llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.3,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    response_schema=EvaluatorState.model_json_schema(),  
    response_mime_type = 'application/json',
)
    user_state = state["user_state"]
    generated_state = state["generated_state"]

    # Format the user fields as required
    formatted_user_config = format_user_config(user_state)
    # Format the generated content as required
    formatted_generated_content = format_generated_content(generated_state["generated_content"])

    # Prepare the input for the prompt
    prompt_load = {
        "USER_CONFIG": formatted_user_config,
        "ALLOW_DYNAMIC_CONTENT_GENERATION": user_state["dynamic_generation"],
        "GENERATED_CONTENT": formatted_generated_content,
    }

    # Format the prompt using the template
    prompt = evaluator_prompt.format(**prompt_load)

    # Invoke the LLM with the formatted prompt
    response = llm.invoke(prompt)
    eval_data = json.loads(response.content)


    # ---------- PRETTY PRINT SUMMARY ----------
    print("🔍 Evaluation Summary")
    print("-" * 60)
    print(format_evaluation(eval_data))
    print()
    # -----------------------------------------

    # store evaluator output for this step
    state["evaluator_state"] = eval_data

    if "evaluator_history" not in state:
        state["evaluator_history"] = []
    # append memory
    state["evaluator_history"].append({
        "coherency_score": eval_data["coherency_score"],
        "next_action": eval_data["next_action"],
        "diagnostic_summary": eval_data["evaluator_diagnostic_summary"],
        "semantic_issues": eval_data["semantic_issues"],
        "structural_changes": eval_data["structural_changes"],
        "evaluator_diagnostic_summary": eval_data["evaluator_diagnostic_summary"],
    })

    return state


    
def should_refine_edge(state: GraphState) -> GraphState:
    """ Decides if generated content needs refinement """
    evaluated_state = state["evaluator_state"]
    next_action = evaluated_state["next_action"]
    if next_action != "no_action":
        return next_action
    return END
    


def semantic_refine(state:GraphState) -> GraphState:
    """ Semantic refinement of sections """
    print("\n" + "="*60)
    print("---SEMANTIC REFINEMENT NODE---")
    print("="*60 + "\n")

    llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    response_schema=GeneratedState.model_json_schema(),  
    response_mime_type = 'application/json',
)
    user_state = state["user_state"]
    generated_state = state["generated_state"]
    evaluator_state = state["evaluator_state"]

    # Format the user fields as required
    formatted_user_config = format_user_config(user_state)
    # Format the generated content as required
    formatted_generated_content = format_generated_content(generated_state["generated_content"])
    # Format the evaluator content as required
    formatted_evaluation = format_evaluation(evaluator_state)


    # Prepare the input for the prompt
    prompt_load = {
        "USER_CONFIG": formatted_user_config,
        "GENERATED_CONTENT": formatted_generated_content,
        "SEMANTIC_FEEDBACK": formatted_evaluation,
    }

    # Format the prompt using the template
    prompt = semantic_refine_prompt.format(**prompt_load)

    # Invoke the LLM with the formatted prompt
    response = llm.invoke(prompt)
    
    return {"generated_state":json.loads(response.content)}

def structural_refine(state:GraphState) -> GraphState:
    """ Structural refinement of sections """
    print("\n" + "="*60)
    print("---STRUCTURAL REFINEMENT NODE---")
    print("="*60 + "\n")

    llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    response_schema=GeneratedState.model_json_schema(),  
    response_mime_type = 'application/json',
)
    user_state = state["user_state"]
    generated_state = state["generated_state"]
    evaluator_state = state["evaluator_state"]

    # Format the user fields as required
    formatted_user_config = format_user_config(user_state)
    # Format the generated content as required
    formatted_generated_content = format_generated_content(generated_state["generated_content"])
    # Format the evaluator content as required
    formatted_evaluation = format_evaluation(evaluator_state)


    # Prepare the input for the prompt
    prompt_load = {
        "USER_CONFIG": formatted_user_config,
        "GENERATED_CONTENT": formatted_generated_content,
        "STRUCTURAL_FEEDBACK": formatted_evaluation,
    }

    # Format the prompt using the template
    prompt = structural_refine_prompt.format(**prompt_load)

    # Invoke the LLM with the formatted prompt
    response = llm.invoke(prompt)
    
    return {"generated_state":json.loads(response.content)}

    
def supervisor(state:GraphState) -> GraphState:
    supervisor_state = state["supervisor_state"]
    if supervisor_state["trigger_action"] == "generate":
        return "generate_initial_draft"
    elif supervisor_state["trigger_action"] == "evaluate":
        return "evaluator"
    # return "generate_initial_draft"

# Create the graph
graph = StateGraph(GraphState)

# Add nodes
graph.add_conditional_edges(
    START,
    supervisor, 
    ["generate_initial_draft", "evaluator"]
)
graph.add_node("generate_initial_draft", generate_initial_draft)
graph.add_node("evaluator",evaluator)
graph.add_node("semantic_refine", semantic_refine)
graph.add_node("structural_refine",structural_refine)

# Set entry point and edges
# graph.set_entry_point("generate_initial_draft")
graph.add_edge("generate_initial_draft", "evaluator")
graph.add_edge("evaluator",END)
graph.add_conditional_edges(
    "evaluator",
    should_refine_edge,
    ["semantic_refine", "structural_refine", END]
)
graph.add_edge("semantic_refine", "evaluator")
graph.add_edge("structural_refine", "evaluator")


# Compile the graph
chain = graph.compile()
