# Tiny Lessons

Hardcoding knowledge gets smoked by machine learning every time, but

I do not think learning has to stop at the boundary of one giant model\. I want to try it inside smaller jobs, in the choice of which model to call, and in how those calls fit together\.

The bet is that a specialist could do a particular job better than a larger general model, and that composing specialists could make an interaction system affordable to keep using\. Could is doing work there\. I still need the comparison\.

<ZefCallout label={"Working draft"} tone={"violet"}>

This is a working hypothesis motivated by an experimental interaction demo\. The comparisons below have not been run\.

</ZefCallout>

## Small jobs, plenty left to learn

An assistant might need to notice a change, think through a difficult question, or decide whether this is a good moment to speak\. I do not see why those jobs should automatically have the same model, the same input, or the same amount of compute\.

GHN, the interaction demo I have been building, gives me somewhere to explore that\. I see some overlap in the interactions I want and the ones in [Thinking Machines' demo](<https://thinkingmachines.ai/blog/interaction-models/>)\. Their interaction model works alongside an asynchronous background model\. I am interested in that division of work; my demo does not establish their capabilities or reliability\.

The question for me is how much of the recurring work can be learned by a smaller component\. What does it need to remember? What can it decide locally? When should it ask a more capable model for help?

## Where does the bitter lesson go?

Richard Sutton's [The Bitter Lesson](<https://www.cs.utexas.edu/~eunsol/courses/data/bitter_lesson.pdf>) argues for general methods that keep benefiting from computation, especially search and learning\. My question is where to apply that learning in the system\.

I could keep adding rules for every situation I encounter\. But as examples accumulate, I would rather test whether a component can learn the recurring job and handle cases I did not write a rule for\. Choosing which component to call could be learned as well\.

Alex L\. Zhang's [Language Model “Shape”](<https://alexzhang13.github.io/blog/2026/shape/>) helped me think about inputs and outputs fitted to a job\. For an observation request, I want to try a model whose output is shaped around that decision\. A convenient output is still no guarantee of a correct one\.

Zhang, Zhening Li, and Omar Khattab's [The Mismanaged Geniuses Hypothesis](<https://alexzhang13.github.io/blog/2026/mgh/>) makes the case for learning how to decompose work and compose model calls\. I take that as a research direction, not a result for the group of specialists I want to build\.

There is learning inside the component, learning which component to use, and changing the arrangement based on independently checked outcomes\. Calling the components small does not make any of that work go away\.

## Train the arrangement, not just the parts

Alex Zhang and Omar Khattab's [Language model harnesses are compositional generalizers](<https://alexzhang13.github.io/blog/2026/harness/>) is the other important source here\. Their experiments train the root model inside an RLM harness and test length and strategy generalization\. They report gains in those settings, alongside extra training runtime\. That is stronger evidence than a persuasive diagram of model calls\.

It is also a different experiment from plugging several tiny models together\. Their results do not establish my interaction system's cost or capability\. The part I want to carry over is co\-design: what a model can learn depends on the structure in which we ask it to work\.

There are two knobs I should not confuse\. Orchestration changes what the harness passes between calls, which calls it makes, and what code does with the answers\. Training changes model parameters from examples and outcomes\. I can improve an orchestration rule without having trained anything\. I can also train a specialist that makes the whole system worse\.

For the tiny\-model bet, I want jobs small enough to define and evaluate, and a composition that can eventually be learned rather than hand\-tuned forever\. The claim I want to test is better capability on specified interaction tasks at a fraction of the total cost\. I do not have that result yet, and it would not establish superiority on arbitrary tasks\.

This is where I take the Bitter Lesson seriously\. If my contribution is an ever\-growing collection of clever exceptions, a more general learned method may make it obsolete\. The point is to find a useful structure for learning and then let the evidence tell me how much of that structure should survive\.

## Priors worth comparing against

[RouteLLM](<https://arxiv.org/abs/2406.18665>), by Isaac Ong and colleagues, trains routers to choose between stronger and weaker language models using preference data\. It reports cost reductions while maintaining response quality on its evaluated benchmarks\. That supports taking learned allocation seriously\. It does not establish the cost of a continuously watching multimodal agent\.

[MiniLLM](<https://arxiv.org/abs/2306.08543>), by Yuxian Gu and colleagues, studies distilling larger language models into smaller ones\. That is a prior for training a component, not evidence that my proposed components will compose correctly\. Routing, distillation, and training a decomposition policy are related options; they are not interchangeable results\.

[ToolOrchestra](<https://arxiv.org/abs/2511.21689>), by Hongjin Su and colleagues, is closer to the orchestration bet: it trains an 8B controller with reinforcement learning to use models and tools\. The paper reports better benchmark performance at lower cost than its comparison systems\. But the controller can call larger models\. It would be misleading to describe that as an isolated 8B model beating a frontier model\.

There are results pushing the other way too\. [Single\-Agent LLMs Outperform Multi\-Agent Systems on Multi\-Hop Reasoning Under Equal Thinking Token Budgets](<https://arxiv.org/abs/2604.02460>) finds that single\-agent methods match or outperform the multi\-agent methods studied when reasoning budgets are matched\. That is not a test of every heterogeneous specialist system\. It is a reason to stop treating more agents as free capability\.

There is counterpressure even in the harness work that motivates this bet\. More calls add overhead, and a learned decomposition can fail to generalize\. A strong general model can also save calls through caching and a good harness\. I need to compare the useful output of the whole system, not its smallest model or cheapest request\.

## I want to be able to keep it on

I use AI to expand what I can build and learn\. If every small task needs the most expensive service, that limits how much I can use it, and who else can afford to use something like it\.

I care about the environmental cost too\. But I cannot turn a lower API bill into an energy claim\. I would need to count training, idle work, repeated calls, and the work of moving information between components\. A small model in a wasteful loop can still waste plenty\.

I would like more of this to run on the person's own device when practical\. When it needs a hosted model, the person should be able to see what leaves the device and decide whether that is acceptable\.

The same goes for personalization\. I want to inspect and correct what the system keeps, export it, and change providers without rebuilding that history from scratch\. Small models do not give me that by default\. The storage, formats, and interfaces have to support it\.

## Start with one fair comparison

I would start with deciding whether an observation matters to an active request\. Give a rule, a learned specialist, and a strong general model the same task and evidence\. Keep examples aside for testing, including scene changes that could break a narrow model\.

Then compare the assembled systems\. Count missed events, false interruptions, response time, and total cost, using the same independent outcome check\. A specialist can pass its own test and still contribute to a bad response when another component misreads its output\.

The general model deserves useful context, tools, and sensible caching or batching too\. I also need to count collecting examples and training\. A cheap call is not much of a win if preparing the specialist costs more than the job will ever justify\.

<StudioFigure id="mechanics-break-even" />

If the specialist does better, I want to find where that stops being true\. If the general model does better, I want that result to change what I build\. One useful job is enough to start\. I do not need a whole imagined architecture to win the argument first\.

The desired experience is in [Fluid Human\-Agent Interactions](</notes/the-learning-partner-i-want>)\. [Your Agent Needs a Thalamus](</notes/your-agent-needs-a-thalamus>) develops the attention\-loop instance; this article owns the broader learning and co\-design bet\.

## Continue the series

Previous: [Models as Functions](</notes/models-as-functions>)\. Next: [Memory That Changes What an Agent Does](</notes/memory-that-changes-what-an-agent-does>)\. The separate [verification note](</notes/dont-let-the-agent-grade-its-own-homework>) explains why the outcome check sits outside the system doing the work\.

## Source notes

Richard Sutton, [The Bitter Lesson](<https://www.cs.utexas.edu/~eunsol/courses/data/bitter_lesson.pdf>) \- the argument for methods that keep benefiting from computation through search and learning\. This is a university\-hosted copy of the 2019 essay\.

Alex L\. Zhang, [Language Model “Shape”](<https://alexzhang13.github.io/blog/2026/shape/>) \- the question of fitting a model's input and output structure to its role in a larger system\.

Alex L\. Zhang, Zhening Li, and Omar Khattab, [The Mismanaged Geniuses Hypothesis](<https://alexzhang13.github.io/blog/2026/mgh/>) \- learning how to decompose work and compose model calls; a research direction, not proof of this proposal\.

Thinking Machines Lab, [Interaction Models: A Scalable Approach to Human\-AI Collaboration](<https://thinkingmachines.ai/blog/interaction-models/>) \- continuous interaction paired with asynchronous background reasoning, and an interaction demo that gives me a useful comparison point\.

Alex Zhang and Omar Khattab, [Language model harnesses are compositional generalizers](<https://alexzhang13.github.io/blog/2026/harness/>) \- training within an RLM harness, generalization experiments, and the distinction between learned decomposition and indefinitely hand\-designed task rules\.

Isaac Ong et al\., [RouteLLM: Learning to Route LLMs with Preference Data](<https://arxiv.org/abs/2406.18665>) \- a learned allocation prior, with benchmark\-specific cost and quality results\.

Yuxian Gu et al\., [MiniLLM: On\-Policy Distillation of Large Language Models](<https://arxiv.org/abs/2306.08543>) \- a training prior for smaller models, distinct from inference orchestration\.

Hongjin Su et al\., [ToolOrchestra](<https://arxiv.org/abs/2511.21689>) \- a trained small orchestrator over other models and tools, with system\-level benchmark comparisons\.

[Single\-Agent LLMs Outperform Multi\-Agent Systems on Multi\-Hop Reasoning Under Equal Thinking Token Budgets](<https://arxiv.org/abs/2604.02460>) \- counterevidence to assuming that multi\-agent gains survive a matched reasoning budget\.