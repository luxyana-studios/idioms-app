import type { Idiom } from "../types";

export const MOCK_IDIOMS: Idiom[] = [
  {
    id: "1",
    phrase: "Break a leg",
    definition: "A superstitious way to say 'good luck' before a performance.",
    category: "Luck",
    level: "Beginner",
    usersLearned: 324,
    origin:
      "The phrase is believed to originate from theater culture in the early 20th century, where wishing someone 'good luck' was considered bad luck.",
    examples: [
      "You're going to do great at the audition — break a leg!",
      "The whole team told her to break a leg before the presentation.",
    ],
  },
  {
    id: "2",
    phrase: "Bite the bullet",
    definition:
      "To endure a painful or unpleasant situation that is unavoidable.",
    category: "Courage",
    level: "Intermediate",
    usersLearned: 512,
    origin:
      "Historically, soldiers were given a lead bullet to bite during surgery before anesthesia was available. First written record appeared in 1891 in Rudyard Kipling's novel.",
    examples: [
      "I hate going to the dentist, but I just have to bite the bullet.",
      "The company bit the bullet and issued a full recall.",
    ],
  },
  {
    id: "3",
    phrase: "Hit the nail on the head",
    definition: "To describe exactly what is causing a situation or problem.",
    category: "Accuracy",
    level: "Beginner",
    usersLearned: 867,
    origin:
      "This phrase comes from carpentry — hitting a nail precisely on its head drives it in cleanly, while a glancing blow bends it.",
    examples: [
      "You hit the nail on the head — that's exactly what's wrong.",
      "Her analysis hit the nail on the head.",
    ],
  },
  {
    id: "4",
    phrase: "Under the weather",
    definition: "Feeling ill or below par, not in one's best health.",
    category: "Health",
    level: "Beginner",
    usersLearned: 1203,
    origin:
      "A nautical expression — when a sailor was sick, he would go below deck to shelter from the weather, hence 'under the weather'.",
    examples: [
      "I'm feeling a bit under the weather today.",
      "She called in sick — she's been under the weather all week.",
    ],
  },
  {
    id: "5",
    phrase: "Spill the beans",
    definition: "To reveal secret information accidentally or prematurely.",
    category: "Secrets",
    level: "Beginner",
    usersLearned: 743,
    origin:
      "Possibly from ancient Greek voting practices using beans, where spilling them would prematurely reveal the vote.",
    examples: [
      "Don't spill the beans about the surprise party!",
      "He accidentally spilled the beans about the merger.",
    ],
  },
];
