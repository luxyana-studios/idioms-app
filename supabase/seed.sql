-- Seed idioms table with mock data
insert into public.idioms (phrase, definition, category, level, users_learned, origin, examples)
values
(
  'Break a leg',
  'A superstitious way to say ''good luck'' before a performance.',
  'Luck',
  'Beginner',
  324,
  'The phrase is believed to originate from theater culture in the early 20th century, where wishing someone ''good luck'' was considered bad luck.',
  array['You''re going to do great at the audition — break a leg!', 'The whole team told her to break a leg before the presentation.']
),
(
  'Bite the bullet',
  'To endure a painful or unpleasant situation that is unavoidable.',
  'Courage',
  'Intermediate',
  512,
  'Historically, soldiers were given a lead bullet to bite during surgery before anesthesia was available. First written record appeared in 1891 in Rudyard Kipling''s novel.',
  array['I hate going to the dentist, but I just have to bite the bullet.', 'The company bit the bullet and issued a full recall.']
),
(
  'Hit the nail on the head',
  'To describe exactly what is causing a situation or problem.',
  'Accuracy',
  'Beginner',
  867,
  'This phrase comes from carpentry — hitting a nail precisely on its head drives it in cleanly, while a glancing blow bends it.',
  array['You hit the nail on the head — that''s exactly what''s wrong.', 'Her analysis hit the nail on the head.']
),
(
  'Under the weather',
  'Feeling ill or below par, not in one''s best health.',
  'Health',
  'Beginner',
  1203,
  'A nautical expression — when a sailor was sick, he would go below deck to shelter from the weather, hence ''under the weather''.',
  array['I''m feeling a bit under the weather today.', 'She called in sick — she''s been under the weather all week.']
),
(
  'Spill the beans',
  'To reveal secret information accidentally or prematurely.',
  'Secrets',
  'Beginner',
  743,
  'Possibly from ancient Greek voting practices using beans, where spilling them would prematurely reveal the vote.',
  array['Don''t spill the beans about the surprise party!', 'He accidentally spilled the beans about the merger.']
);
