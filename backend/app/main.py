from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.datamodels import GenerateStateInput, EvalStateInput, GenerateRequest
from app.agents.workflow import chain
import uuid



import io
from docx import Document
from pptx import Presentation
from app.service.format_output_file import build_docx, build_pptx

app = FastAPI()
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/")
async def root():
    return {"status": "online"}


@app.post("/generate")  
async def generate_document(req: GenerateStateInput):  ## Payload of necessary fields is auto validated
    """
    Triggers full graph execution:
    supervisor → initial draft → evaluator → refinements → final draft
    """

    # ---- 1. Early validation ----
    if not req.main_topic or req.main_topic.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Missing required field: main_topic"
        )

    # ---- 2. Prepare graph input ----
    input_state = {
        "supervisor_state": {"trigger_action": "generate"},
        "user_state": req.model_dump()
    }

    # ---- 3. Run graph ----
    try:
        result = chain.invoke(input_state)

    except Exception as e:
        # Graph execution error ONLY (500)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "GraphExecutionError",
                "message": str(e)
            }
        )

    generated_content = result["generated_state"]["generated_content"]
    for entry in generated_content:
        entry["id"] = str(uuid.uuid4())

    return_payload = {
        "generated_content" : generated_content,
        "coherency_score": result["evaluator_state"]["coherency_score"],
        "evaluator_diagnostic_summary": result["evaluator_history"][-1]["evaluator_diagnostic_summary"],
    }
    return return_payload



@app.post("/evaluate")  
async def evaluate_document(req: EvalStateInput):  ## Payload of necessary fields is auto validated
    """
    Triggers full graph execution:
    supervisor → initial draft → evaluator → refinements → final draft
    """

    # ---- 1. Early validation ----
    if not req.main_topic or req.main_topic.strip() == "":
        raise HTTPException(
            status_code=400,
            detail="Missing required field: main_topic"
        )
    

    # ---- 2. Prepare graph input ----
    input_state = {
        "supervisor_state": {"trigger_action": "evaluate"},
        "user_state": req.model_dump(exclude={"generated_content"}),
        "generated_state": {"generated_content": [item.model_dump() for item in req.generated_content]}
    }

    # ---- 3. Run graph ----
    try:
        result = chain.invoke(input_state)

    except Exception as e:
        # Graph execution error ONLY (500)
        raise HTTPException(
            status_code=500,
            detail={
                "error": "GraphExecutionError",
                "message": str(e)
            }
        )

    eval_hist_payload = []
    for eval_hist in result["evaluator_history"]:
        eval_hist_payload.append(
            {
                "coherency_score": eval_hist["coherency_score"],
                "evaluator_diagnostic_summary": eval_hist["evaluator_diagnostic_summary"]
            }
        )
    generated_content = result["generated_state"]["generated_content"]
    for entry in generated_content:
        entry["id"] = str(uuid.uuid4())

    return_payload = {
        "generated_content" : generated_content,
        "eval_hist_payload": eval_hist_payload,
    }
    return return_payload



@app.post("/export")
def export_file(req: GenerateRequest):
    file_type = req.type.lower()

    if file_type not in ["doc", "ppt"]:
        raise HTTPException(status_code=400, detail="Type must be 'doc' or 'ppt'.")

    buffer = io.BytesIO()

    # --------------------------
    # DOCX GENERATION
    # --------------------------
    if file_type == "doc":
        build_docx(req.generated_content, buffer)
        
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": "attachment; filename=output.docx"
            }
        )

    # --------------------------
    # PPTX GENERATION
    # --------------------------
    if file_type == "ppt":
        build_pptx(req.generated_content, buffer)

        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
            headers={
                "Content-Disposition": "attachment; filename=output.pptx"
            }
        )