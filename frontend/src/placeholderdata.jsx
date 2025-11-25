export const initialData = {
  main_topic: "",
  dynamic_generation: true,
  sections: [{ id: "placeholder", section_name: "", description: "" }],
  constraints: "",
  context: "",
  generated_content: [],
  eval_hist_payload: [],
  // main_topic: "Introduction to Microservices Architecture",
  // dynamic_generation: "true",
  // sections: [
  //   {
  //     id: 1,
  //     section_name: "Overview of Microservices",
  //     description:
  //       "Explain what microservices are, including the definition and the rationale behind breaking monolithic systems into smaller components.",
  //   },
  //   {
  //     id: 2,
  //     section_name: "Benefits of Microservices",
  //     description:
  //       "Describe advantages such as scalability, independent deployment, and team autonomy.",
  //   },
  //   {
  //     id: 3,
  //     section_name: "Challenges of Microservices",
  //     description:
  //       "Discuss the difficulties teams face, including distributed complexity, monitoring, and operational overhead.",
  //   },
  //   {
  //     id: 4,
  //     section_name: "Best Practices",
  //     description:
  //       "Provide actionable recommendations for building and maintaining microservice-based systems.",
  //   },
  // ],

  // constraints:
  //   "Tone: professional but friendly. Length: 120–180 words per section. Style: explanatory, clear, and beginner-friendly. Do not use overly technical jargon unless necessary.",

  // context:
  //   "Assume the reader is a junior software developer learning microservices for the first time.",
  // generated_content: [],
  // eval_hist_payload: [],

  // main_topic: "Something about climate change impacts",
  // dynamic_generation: true,
  // sections: [
  //   {
  //     id: 1,
  //     section_name: "effects on weather??",
  //     description:
  //       "write like how weather gets messed up because of climate change. Maybe include storms and floods? also maybe put pollution (not sure if thats related but just add it somewhere)",
  //   },
  //   {
  //     id: 2,
  //     section_name: "Intro",
  //     description:
  //       "just talk about climate change a bit ig, i want it like not too long bc its boring but my professor said it should be kind of detailed so idk",
  //   },
  //   {
  //     id: 3,
  //     section_name: "idk maybe solutions",
  //     description:
  //       "just mention what we can do to stop it but dont go too deep i think. professor said make it practical and also academic?? confusing",
  //   },
  // ],
  // constraints:
  //   "This is for my college assignment and i need like a clean structure but i dont know the structure. short snippet lines. i hate reading big paragraphs so dont make it too blocky. don't make it sound like a wikipedia page, would appreciate points. also try to make it like highly chill like a ppt but the teacher is pretty chill!",
  // context:
  //   "I have literally no idea how climate change works so assume im a beginner. This assignment is due tomorrow so please make it look like i know what im talking about a bit. You can also add sections if needed because i dont know what all should be included.",
  // generated_content: [
  //   {
  //     id: 101,
  //     section_name: "Introduction to Climate Change",
  //     content:
  //       "Climate change is a long-term shift in temperatures and weather patterns. This should probably be the first section but now it's buried in the middle. Human activities like burning fossil fuels release greenhouse gases.",
  //   },
  //   {
  //     id: 102,
  //     section_name: "Extreme Weather Events Are Kinda Wild",
  //     content:
  //       "Storms get worse, heatwaves pop up, and floods happen more often. Also tornadoes sometimes but maybe not related? Anyway this section belongs somewhere but probably not here.",
  //   },
  //   {
  //     id: 103,
  //     section_name: "Beyond Weather: Impacts That Aren't Weather",
  //     content:
  //       "Sea levels rise, oceans acidify, biodiversity decreases. This section is relevant but it’s in the wrong spot and also slightly renamed to confuse structure.",
  //   },
  //   {
  //     id: 104,
  //     section_name: "Solutions (Maybe?)",
  //     content:
  //       "* Switch to renewable energy somehow\n* Better agriculture stuff\n* Insulate houses?? (not sure but sounds right)\nThis section is semi-relevant but messy.",
  //   },
  //   {
  //     id: 105,
  //     section_name: "The Science Behind It",
  //     content:
  //       "CO2 traps heat and a greenhouse effect intensifies. This actually belongs earlier in the structure but is pushed towards the end.",
  //   },
  //   {
  //     id: 106,
  //     section_name: "Fun Facts About Penguins",
  //     content:
  //       "Penguins live in the Southern Hemisphere and are not directly related to climate change assignments. But they are sometimes used as symbols of melting ice caps. This section is not really needed but here it is.",
  //   },
  //   {
  //     id: 107,
  //     section_name: "idk maybe a Section About Volcanoes?",
  //     content:
  //       "Volcanoes release gases and ash. Not super relevant to human-caused climate change but people sometimes confuse them. So here's a whole section that your evaluator should probably flag.",
  //   },
  //   {
  //     id: 108,
  //     section_name: "Random Environmental Thoughts",
  //     content:
  //       "Sometimes I think about recycling and how people don’t do it enough. Also solar panels are shiny. Not sure how much of this fits your user's assignment.",
  //   },
  //   {
  //     id: 109,
  //     section_name: "Completely Useless Section",
  //     content:
  //       "This section has absolutely no purpose. Climate change is real but this part is filler text for testing the evaluator logic.",
  //   },
  //   {
  //     id: 110,
  //     section_name: "Conclusion",
  //     content:
  //       "Before even getting into the details, here is a conclusion for no reason. Climate change is complicated, and people need to work together to fix it. This wraps things up even though nothing has been explained yet.",
  //   },
  // ],
  // eval_hist_payload: [
  //   {
  //     coherency_score: 0.05,
  //     evaluator_diagnostic_summary:
  //       "The generated content is highly disorganized, contains numerous irrelevant sections, and suffers from an overly informal tone. Several sections explicitly acknowledge their own flaws or irrelevance, indicating a complete lack of coherence. Significant structural modifications are required to establish a logical flow, remove extraneous content, and rename sections for clarity and academic appropriateness. Semantic issues also abound, necessitating refinement of language and content for correctness and alignment with user constraints.",
  //   },
  //   {
  //     coherency_score: 0.95,
  //     evaluator_diagnostic_summary:
  //       "The generated content is excellent, demonstrating strong semantic quality and a highly logical structure. It effectively addresses all user requirements, including the need for a beginner-friendly explanation, a chill tone, and a point-based style. The intelligent addition of sections like 'The Science Behind It' and 'Broader Environmental Impacts' significantly enhances the document's comprehensiveness and academic rigor, making it well-suited for a college assignment.",
  //   },
  // ],
};
