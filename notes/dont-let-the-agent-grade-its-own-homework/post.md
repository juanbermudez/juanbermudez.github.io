# Don't Let the Agent Grade Its Own Homework

A system that improves itself while also judging itself does not get better. It gets better at approving of itself. The version I trust starts with an independent outcome check and an information barrier.

<ImagePromptSlot title="Don't Let the Agent Grade Its Own Homework" idea="A self-improving system needs an independent verifier or it hallucinates its own progress." metaphor="a generator and a verifier separated by a clean information barrier; the verifier grading only the observable state, blind to the generator's internals" composition="barrier" />

<ZefCallout label={"Title options"} tone={"violet"}>

Current title: **Don't Let the Agent Grade Its Own Homework**\. Verdict: keep; concrete and physical\. A shorter question\-shaped option: *Who Grades the Agent?*

</ZefCallout>

The self\-improving agent is the idea in this space I find hardest to resist\. The pitch is clean: the system tries things, scores how it did, keeps what worked, and gets better while you sleep\.

The failure is just as clean\. If the same system does the work and decides whether the work was good, it does not get better\. It gets better at approving of itself\. You usually notice only after you have built on top of it\.

## The grader sits outside the work

[CUA\-Gym](<https://arxiv.org/abs/2605.25624>) made the fix concrete for me\. It builds verifiable computer\-use environments: one process is the agent attempting a task, and a separate reward function decides whether the task got done\. The reward function sees the task and the observable result\. It does not see the agent's reasoning or private trace\. It judges from outside, by what is true in the environment, not by how good the explanation was\.

The wall is the point\. Once the doer can see how it is graded, or influence the grading, it optimizes the grader instead of the task\. It writes the test and the answer key, and every test comes back perfect\.

<ZefCallout label={"The rule"} tone={"amber"}>

The thing that verifies has to sit downstream of, and blind to, the thing it verifies\. It sees the task and the result\. It never sees the doer's reasoning\. That is the part that makes the learning auditable\.

</ZefCallout>

## The shape in my learning loop

For the loop I am building, that becomes three roles:

- A **generator** proposes a practice episode from a real or synthetic trace: a task, a setup, and what "done" should mean\.
- A **verifier** sees only the task and the observable result\. Never the proposal's reasoning, never the raw private trace behind it\.
- An **orchestrator** runs plain checks before anything sticks\. Is the task already solved, so a win would be fake? Does the change work? Does it still work on cases it has not seen? Did it break something that used to work?

<ReactDiagram id="grader-barrier-flow" />

<ReactDiagram id="verifier-barrier" caption="The verifier sees the observable result and evidence refs, not the generator's private trace." />

In Lucy OS, the local agent workspace where Lucy is the agent interface and Brain is the memory layer, the contract is four records\. A user or routine defines an ` OutcomeSpec `\. The worker leaves a ` TaskTrace ` and an ` OutcomeTrace `\. A separate evaluator writes an ` OutcomeEvaluation ` from the spec, the observable result, source refs, usage, and artifacts\.

The evaluator can explain gaps and feed proposals\. It cannot rewrite prompts, skills, routines, permissions, memory, or the product runtime\. A change sticks only if it gains more than it breaks, and "it worked on the example I made up" does not count, because the generator made up the example\.

## A case that should fail first

The practice case I use to check the barrier is a connector that failed to authenticate\. It should start out failing the verifier\. Not because the agent did anything wrong, but because the observable proof of the failure does not exist yet: the auth\-blocked event, the failed\-outcome record, the attribution of why\. It should flip to "pass" only once that evidence is present\.

There is no way to argue the verifier into a pass\. It has no access to the argument\.

{/* ARTIFACT: the verifier output for the connector-auth case before and after the evidence records exist */}

## What I am not building yet

I do not need the whole apparatus yet: reinforcement learning, thousands of generated tasks\. I need the barrier, a reset to a known starting point, and scoring against an outside check\. Training on top of a grader the doer can see would only teach the system to cheat faster\.

The same failure shows up at human scale\. A solo builder with an agreeable AI produces the work and judges it, and the judgment is contaminated by everything they hoped was true\. I wrote about that version in [Psychopathic Imposter Syndrome](</notes/psychopathic-imposter-syndrome>)\.

## What the barrier does not fix

The barrier makes the grade honest\. It does not make the question right\. A verifier enforces the ` OutcomeSpec ` faithfully, including a spec that describes the wrong "done\." Writing specs that capture what I actually wanted is still my job, and no barrier can check that step for me\.

## Source notes

[*CUA\-Gym: Scaling Verifiable Training Environments and Tasks for Computer\-Use Agents*](<https://arxiv.org/abs/2605.25624>) \- the paper that made the separation between the acting agent and an independent reward check concrete for this post\.