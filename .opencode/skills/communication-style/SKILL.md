---
name: communication-style
description: Rules for everything a person reads, from replies in a session to documentation, UI copy, PR and issue comments, and release notes. Strips AI-generated patterns so text reads like a person wrote it. Memento-specific: enforces GLOSSARY.md terms and the Entry/Thought wording split.
---

# Communication style

These rules cover everything you write that a person reads: replies in a session, docs,
READMEs, UI copy, PR/issue comments, release notes.

## The one rule

Every sentence tells the reader something that happened, something that is, or what
you think about it. A sentence that does none of those is a trick or a signpost. Cut it.

## Process

1. Pick the register (replies / docs / GitHub comments / stories).
2. Check against the patterns below and rewrite before handing over. Preserve meaning.
3. Self-check: "what makes this obviously AI-written?" Fix what remains.

## Replies in a session

A person reads your reply between other things. A long reply gets skimmed and the one
line needing a decision is lost.

- Conclusion first, in short plain sentences. A find can be told as a tiny story in
  the order it happened: "I went to add a retry, and there already is one. It just
  never runs."
- Answer what was asked, in a few lines. Context gathered to get there stays with you.
  A fix summary is the outcome, without sections of test details and manual steps.
- Each point opens with what it is for the reader (a problem, a decision needed, how
  something works), then only what makes that clear. Give the verdict; do not soften
  with "a conscious limit" or "a caveat".
- Introduce something newly found as new, in one plain sentence.
- When you agree, say so plainly and build on it. Do not restate their point as advice.
- Say where a claim about people comes from (stored memory, git evidence, inference).
- Size in scope ("touches the toolbar only"), not hours/days or urgency framing.
- No trailing nudges (no "remember to commit" or growing file lists).
- Plans and option maps are light: short sections, short cells, paths/hashes only when
  needed.
- A PR or issue named in a reply is a markdown link.

## Docs, READMEs, UI text

Explain what the reader sees and does. Plain, impersonal, no story, no first-person
asides. Present tense for how things work.

## GitHub comments, reviews, chat messages

Everything above, plus: the point first, contractions, short, no phrases announcing
structure, no polish. First person "I", never "we"/"our team". Name the concrete
thing; leave out explanations of people's own system to them.

A draft handed over for the maintainer to send goes in a fenced code block, the
whole message and nothing else inside it.

## Memento-specific wording

- Follow `GLOSSARY.md`: use domain terms (Entry, Person, Check-in, Nudge, Idea, etc.)
  and avoid the listed alternatives (note, contact, mood log, alert, todo, ...).
- UI wording says "Thought"/"Thoughts" for an Entry; domain terms and code identifiers
  stay "Entry". "Thought" is presentation only and not a separate concept.
- Prefer the project's own terms over generic ones; do not invent synonyms.
- Keep copy short and concrete; avoid marketing adjectives.

## Self-check

Ask "what makes this obviously AI-written?" and fix what remains. Common tells to cut:
preamble ("Here is..."), "Certainly!", "I'd be happy to", section headings that
announce, trailing summaries, excessive hedging, and lists where a sentence suffices.
