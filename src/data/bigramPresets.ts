import { BigramPreset } from '../types';

export const BIGRAM_PRESETS: BigramPreset[] = [
  {
    id: 'shakespeare',
    name: "Shakespeare's Soliloquies",
    description: 'Poetic classic English literature from Hamlet, Macbeth, and the Sonnets.',
    tag: 'Classic Literature',
    sampleStartWord: 'to',
    text: `To be or not to be that is the question.
Whether tis nobler in the mind to suffer the slings and arrows of outrageous fortune,
or to take arms against a sea of troubles and by opposing end them.
To die to sleep no more, and by a sleep to say we end the heartache
and the thousand natural shocks that flesh is heir to.
Tis a consummation devoutly to be wished.
To die to sleep to sleep perchance to dream.
Ay there's the rub, for in that sleep of death what dreams may come
when we have shuffled off this mortal coil must give us pause.
There's the respect that makes calamity of so long life.
For who would bear the whips and scorns of time,
the oppressor's wrong, the proud man's contumely,
the pangs of despised love, the law's delay,
the insolence of office and the spurns that patient merit of the unworthy takes,
when he himself might his quietus make with a bare bodkin?
Who would fardels bear, to grunt and sweat under a weary life,
but that the dread of something after death,
the undiscovered country from whose bourn no traveller returns,
puzzles the will and makes us rather bear those ills we have
than fly to others that we know not of?
Thus conscience does make cowards of us all,
and thus the native hue of resolution is sicklied o'er with the pale cast of thought,
and enterprises of great pith and moment with this regard their currents turn awry
and lose the name of action.`,
  },
  {
    id: 'ai_foundations',
    name: 'Foundations of Artificial Intelligence',
    description: 'Excerpts on tokenization, probabilistic language models, and neural attention.',
    tag: 'Computer Science',
    sampleStartWord: 'the',
    text: `The foundations of modern artificial intelligence rest upon statistical language modeling.
A language model assigns a probability distribution over sequences of words.
Given a sequence of previous tokens, the model computes the likelihood of the next token.
In an n-gram model, we make the Markov assumption that the probability of the next word depends only on the previous n minus one words.
A bigram model approximates the conditional probability of a word given only its single immediate predecessor.
The transition probability from word A to word B is estimated by counting how many times word B follows word A divided by the total frequency of word A.
When vocabulary size grows large, many valid bigrams have zero frequency in the training corpus.
To solve this sparsity problem, smoothing techniques such as Laplace add-one smoothing or Good-Turing discounting are introduced.
Modern large language models replace discrete n-gram tables with deep transformer neural networks.
The self-attention mechanism allows the network to dynamically weigh tokens across long contexts.
Yet the core objective remains the same: minimizing cross-entropy loss and predicting the most probable next token in human language.`,
  },
  {
    id: 'aesop_fables',
    name: "Aesop's Fables",
    description: 'Narrative storytelling with recurring patterns, dialogue, and moral lessons.',
    tag: 'Narrative Prose',
    sampleStartWord: 'the',
    text: `The Hare was once boasting of his great speed before the other animals.
I have never yet been beaten, said the Hare, when I put forth my full speed.
I challenge any one here to race with me.
The Tortoise said quietly, I accept your challenge.
That is a good joke, said the Hare; I could dance around you all the way.
Keep your boasting till you have won, answered the Tortoise. Shall we begin?
So a course was marked out and a starting point agreed upon.
The Hare darted almost out of sight at once, but soon stopped to show his contempt for the Tortoise.
He lay down by the wayside to take a nap.
The Tortoise plodded along steadily, never stopping for a moment.
When the Hare awoke from his sleep, he saw the Tortoise near the finish line.
The Hare ran as fast as he could, but he was too late.
The Tortoise had already crossed the winning post.
Slow and steady wins the race, smiled the wise old Tortoise to the astonished crowd.`,
  },
  {
    id: 'stoic_philosophy',
    name: 'Stoic Meditations',
    description: 'Reflective philosophical prose on reason, perception, and virtue.',
    tag: 'Philosophy',
    sampleStartWord: 'you',
    text: `You have power over your mind, not outside events.
Realize this and you will find your true strength.
The happiness of your life depends upon the quality of your thoughts.
Therefore guard accordingly, and take care that you entertain no notions unsuitable to virtue and reasonable nature.
Waste no more time arguing about what a good person should be; be one.
When you arise in the morning think of what a precious privilege it is to be alive, to breathe, to think, to enjoy, to love.
Dwell on the beauty of life. Watch the stars, and see yourself running with them.
The soul becomes dyed with the color of its thoughts.
Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.
Never let the future disturb you; you will meet it, if you have to, with the same weapons of reason which today arm you against the present.`,
  },
];
