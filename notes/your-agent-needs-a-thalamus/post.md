# Your Agent Needs a Thalamus

Agents like dot and grok are great, but

<AttentionSkull />

Let me be clear: I know the model is going to devour the harness. With enough compute, quality data, and the right training recipe, the big monolith will crush it. I believe in the [Bitter Lesson](<https://www.cs.utexas.edu/~eunsol/courses/data/bitter_lesson.pdf>). But complex organisms aren’t single, undifferentiated blobs of tissue doing everything at once. With a limited energy budget and jobs that pull in different directions, they evolved specialized organs, hierarchies of control, and dedicated systems for specific tasks. A personal, always-on agent faces the same two pressures: a fixed compute budget, and jobs that conflict, like watching continuously, answering instantly, and reasoning slowly. That is why I think it needs something similar. The comparison breaks in one place: evolution found its structure through blind search over an enormous number of generations, the Bitter Lesson’s own method, while I am arranging the parts by hand.

This post is how those parts fit together in GHN, the experimental demo behind [Fluid Human-Agent Interactions](</notes/the-learning-partner-i-want>): what each part does, what the thalamus in the title is for, and where it breaks today.

<ZefCallout label={"Working draft"} tone={"violet"}>

The thalamus in the title is an analogy for a software question: a proposed attention gate, not a reproduced brain structure or a finished learned system. Some of what follows runs in the GHN code and some is the design I am working toward. I say which is which.

</ZefCallout>

The skull at the top is there to orient the senses. Its colored activity is an illustration, not live GHN telemetry and not a model of a brain doing this task.

## 1. Why not one big model

I want an agent that can keep watching without needing a big model to think about every frame.

If I want an agent fully aware of what I’m doing in real time, the monolithic approach means either evaporating a small lake or hearing “Let me check” 897 times before lunch while I copy/paste like it’s 2025. I’m not a researcher. I’m GPU-poor and token-poor.

**The lock-in problem.** A personal, always-on agent is probably going to become one of the most important digital products in people’s lives, on the order of Gmail, social media, the personal computer, and the phone. Which raises a question that gets surprisingly little attention: when you’ve spent years with an agent that knows your preferences, your likes, your quirks, and some deeply personal information, what happens when you want to switch providers? You would want to keep your agent’s behavior the same even when you’re buying inference from someone else. That alone is a strong argument for a system that makes your agent portable. And private. You probably want to own it.

**The incentive problem.** There’s also the economic argument, and it cuts two ways. Frontier labs can afford products that stream every input to massive models. More than that, they have every incentive to make you send everything their way. That’s the business. Yes, they’re making inference cheaper. But it’s probably a hard sell internally, at a company with billions in compute commitments, to launch a product that isn’t also a distribution point or a way to sell more inference.

Running it locally doesn't make it free, either. A local model has no API bill and can still eat the laptop. Watching, encoding the same frames again, queues, and other work fighting for the GPU all belong in the budget.

## 2. A harness of Tiny Lessons

The agent is based on a specific arrangement of chained models with access to a shared state. You can think of it as a harness version of two model ideas: Mixture of Architectures, a term from a Thinking Machines talk at Stanford on model architecture, and [Liquid Neural Networks](<https://www.liquid.ai/blog/liquid-neural-networks-research>).

This is contrarian to the Bitter Lesson, and I know it. The bet is that hand-drawn boundaries plus small learned specialists work on a laptop today, and that learning replaces the boundaries later. I am decomposing the tasks so each one can be solved efficiently by a specialist. So, just a bunch of [Tiny Lessons](</notes/tiny-lessons>).

I landed on this architecture after months of failed harness prototypes on an M3 Pro with 18GB of memory. I went this way because I am GPU-poor. Once parts of it began to work in GHN (the perception split and the speaker-and-thinker split below), it showed real advantages over scaling one larger model across broad domains, even if only as a fast way to prototype a model architecture. The clearest one is debugging: separate parts give me separate places to look when the agent gets something wrong.

In GHN, I separate four jobs, even when they share a model:

- **Perception:** Record observations and their sources: window images, cursor movement, speech.
- **Shared state:** Connect the task, relevant entities, instructions, and observations.
- **Model decisions:** Decide what needs closer attention, then interpret the evidence.
- **Action timing:** Track pending work and decide whether a response belongs now, later, or not at all.

If the agent gets “this” wrong, I want to find where it went wrong. Did it never get the pixels? Did it use stale context? Did it misread the evidence? Or did a reasonable answer arrive after we moved on? Those failures need different changes.

<StudioFigure id="papers-log-composition" />

I'm not the first to split it this way. Rui Qian and colleagues' [Dispider](<https://arxiv.org/abs/2501.03218>) separates perception, the decision about when to interact, and the reply in streaming video, so watching keeps going while an answer is produced. That's a useful prior. Their results belong to their video tasks and their implementation; they don't validate my gate or the biology in the title.

## 3. What comes in

Perception only observes. In the GHN computer-perception code, window and cursor state are separate from captured pixels. The cursor supplies a candidate for where to look; a fresh window image supplies visual evidence. The label of a window, or a path traced by the cursor, cannot establish what I meant on its own.

That computer-screen channel does not click, type, or edit anything. The shared canvas in [Fluid Human-Agent Interactions](</notes/the-learning-partner-i-want>) is what I want to work toward, not a finished capability I can point to in this code.

Not everything is kept the same way, either. Some things are kept for good: my goals, the clock, files the agent touched. Camera frames last ten seconds and then they're gone, not summarized. When I start talking, it takes one glance: the newest frame, where my pointer rested, a picture of the front window. When I stop, it puts one moment together from all of that.

<StudioFigure id="agent-world" />

It also has to work out whether it's me talking. Three clues go into that: how close the voice is to mine, the moment (a video playing makes it less likely), and whether a mouth on camera moves with the sound. The rule and its numbers are in the code; they haven't been measured on real voices yet.

<StudioFigure id="agent-you" />

## 4. What gets through

Something still has to decide what deserves a closer look. If I make that decision badly, the agent can be cheap, quiet, and completely useless. That is the part I want to work on here: what gets through to the model, what gets ignored, and how I find out when ignoring something was a mistake.

The title comes from Wimmer and colleagues' [work on sensory selection](<https://www.nature.com/articles/nature15398>). The relation I borrow is narrow: the active goal changes which observations get passed to a more expensive decision step. A camera event isn't a neural signal, and an API budget isn't a biological energy budget. Calling the part a thalamus doesn't tell me whether it works. It gives me a question I can test: can a goal help a cheaper loop select the evidence a larger model actually needs?

In GHN, inputs only go where a goal can use them. If no goal needs the camera, frames aren't scored at all. Camera checks for every goal are batched into one call, twice a second. A finished worker or a due time is a fact, not a reading, so it skips the evidence step and goes straight through.

<StudioFigure id="agent-match" />

Camera readings are noisy, so a goal builds evidence before it gets the agent's attention. A small model on the laptop scores each frame, about 0.125 s a frame. One blip can't cross the line alone, and the line is set from how many false alarms an hour I'll put up with. Only then does a bigger model take a proper look.

<StudioFigure id="agent-attention" />

This is an old pattern. Apple's [Hey Siri detector](<https://machinelearning.apple.com/research/hey-siri>) uses a small always-on detector to wake a larger checker and the rest of the assistant. A wake phrase is much narrower than following someone's work. What I take from it is that sensing and interpreting don't have to run at the same rate.

The design I'm working toward turns this into a loop, not a filter in front of a model. Observations sit on one shared timeline. The gate picks what goes into a decision packet, and the typed answers change what it picks next. A request can keep attention on a stream; a correction can redirect it; finishing or cancelling the request should release it.

That feedback is the useful part. If the model asks for a closer look at the screen, the next packet should reflect that. If a camera watch is active, it needs evidence even while I'm talking about something else. And an unexpected event needs a budgeted way in, or focus becomes a way to miss everything outside the task.

The design calls that control a gain. It's a software setting for which streams get in, not a claim to reproduce neural gain. Between decisions it can stay put. I don't need another model call just to decide that the last decision still stands.

## 5. From one decision to several actions

One packet can lead to several actions. Maybe the agent answers what it already knows, writes a note, and sends a worker to look into the rest. Code composes those actions and what each one waits for. Writing words is work inside one handler, not a step every action has to wait behind. Speech still has to wait for its turn in the conversation; a silent task doesn't.

<StudioFigure id="agent-actions" />

Follow one request: watch for a particular change. Perception supplies observations. The gate selects evidence against the goal and its budget. The decision can confirm the change, ask for another look, or propose an action. Code still checks authority, freshness, cancellation, and dependencies before the action runs. An alarm only says something deserves a look; it can't establish that the thing happened. And recalling an old request can't quietly grant permission to run it again.

Nothing counts as done until it reports back: the line played, the file exists, the worker came back.

<StudioFigure id="agent-flow" />

I also split the live speaking interface from slower reasoning and tool work. A persistent Codex thinker sends findings back to the speaker. The speaker can answer from available context, request more work, or stay silent. The intention is to keep the interaction going while a task is pending.

But sending a result back is only part of it. Is the finding still relevant? Did I correct the question? Are we in another project now? A background worker needs a way back into the actual conversation.

[Thinking Machines’ interaction-model work](<https://thinkingmachines.ai/blog/interaction-models/>) gives me a reference to study: continuous interaction paired with asynchronous background reasoning and tool work. My speaker-and-thinker split is a separate experiment. I cannot claim the same continuous audio and video capabilities just because the division of work sounds similar.

## 6. Where it breaks today

I'm keeping the design separate from what the code demonstrates. The code has time-indexed observations, typed decision packets, action composition, and channel handlers. The proposed single owner for world state and attention still needs its integration proved. A function existing in a file is not that proof.

The October 17 audit is useful precisely because it doesn't treat the drawing as a working system. It reproduced a case where the seeded detector could alarm when the requested condition became false. Confirmation downstream still matters, so that was a detector counterexample, not a false spoken report.

It also found that cancellation and late results needed a shared, versioned lifecycle, and that picking a line to say was being confused with saying it. Some files have changed since that audit, so I wouldn't present every old finding as an open bug today. I do want those cases in the checks for the consolidated loop.

The same audit joined five recorded turns and reported a median 2.92 seconds from the final transcript to the first audio. That's an observation from that recording, not a product promise. The faster path in the design stays an estimate until a new session measures it.

<StudioFigure id="agent-reply" />

## 7. Count the things it misses

The attention notes brought me to the budget question. ChimpBench gives me a mostly rule-based testbed to inspect. I still need to do the work of having learned decision models drive behavior there, so I can't use it as proof that this learned gate already works.

The engineering bet is that selecting useful evidence lets the system stay available at a lower total cost than running every input through the expensive path. I haven't shown a fraction-of-the-cost result at matched quality.

I'd compare an explicit rule, a learned gate, and a general model looking at the same stream. Same request, same events, same standard for a useful result. Then count compute and latency next to missed events and false interruptions.

I also want a log of what the gate threw away. Otherwise I can make a loop look efficient by hiding the evidence it never gave the rest of the system a chance to use.

The uncomfortable result would be that the general model catches the events my gate keeps throwing away. If that happens, the savings need to sit right next to those misses. I'd rather find that out on one watch request than build the rest of the agent around a bad filter.

## Continue the series

Previous: [Fluid Human-Agent Interactions](</notes/the-learning-partner-i-want>), on what fluid means and how I want to test it. Next: [Models as Functions](</notes/models-as-functions>), which defines the component contracts the gate calls.

Earlier material: [Attention Is a Metabolic Problem](</notes/attention-is-a-metabolic-problem>) and [The Buildable Parts of a Mind-Like Agent](</notes/we-can-build-most-of-a-mind>). Their implementation claims need fresh artifacts before reuse.

## Source notes

- Richard Sutton, [The Bitter Lesson](<https://www.cs.utexas.edu/~eunsol/courses/data/bitter_lesson.pdf>) - why general methods that scale with compute keep winning, and the bet this harness makes against that for now.
- Wimmer et al., [Thalamic control of sensory selection in divided attention](<https://www.nature.com/articles/nature15398>) - the research reference for context-dependent sensory selection. Its transfer to software is a working hypothesis.
- Rui Qian et al., [Dispider](<https://arxiv.org/abs/2501.03218>) - disentangling perception, decision, and reaction for active video interaction.
- Siri Team, [Hey Siri: An On-device DNN-powered Voice Trigger for Apple’s Personal Assistant](<https://machinelearning.apple.com/research/hey-siri>) - a narrow always-on cascade, not a demonstration of general scene understanding.
- Thinking Machines Lab, [Interaction Models: A Scalable Approach to Human-AI Collaboration](<https://thinkingmachines.ai/blog/interaction-models/>) - a reference for continuous interaction paired with asynchronous reasoning and tool work.