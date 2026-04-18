-- Seed: native-language idioms + cross-language translations + equivalents.

insert into public.idioms
  (expression, language_code, idiomatic_meaning, explanation, examples, tags, source, status)
values
(
  'Break a leg',
  'en',
  'A superstitious way to wish someone good luck, especially before a performance.',
  'Believed to originate in early 20th-century theater culture, where wishing someone ''good luck'' directly was considered bad luck.',
  array['You''re going to do great at the audition — break a leg!', 'The whole team told her to break a leg before the presentation.'],
  array['luck', 'theater', 'informal'],
  'human',
  'published'
),
(
  'Bite the bullet',
  'en',
  'To endure a painful or unpleasant situation that is unavoidable.',
  'Historically, soldiers were given a lead bullet to bite during surgery before anesthesia was available. First written record: Rudyard Kipling, 1891.',
  array['I hate going to the dentist, but I just have to bite the bullet.', 'The company bit the bullet and issued a full recall.'],
  array['courage', 'endurance', 'formal'],
  'human',
  'published'
),
(
  'Hit the nail on the head',
  'en',
  'To describe exactly what is causing a situation or problem.',
  'From carpentry — hitting a nail precisely on its head drives it in cleanly, while a glancing blow bends it.',
  array['You hit the nail on the head — that''s exactly what''s wrong.', 'Her analysis hit the nail on the head.'],
  array['accuracy', 'insight', 'informal'],
  'human',
  'published'
),
(
  'Under the weather',
  'en',
  'Feeling ill or below par.',
  'A nautical expression — a sick sailor would go below deck to shelter from the weather, hence "under the weather".',
  array['I''m feeling a bit under the weather today.', 'She called in sick — she''s been under the weather all week.'],
  array['health', 'illness', 'informal'],
  'human',
  'published'
),
(
  'Spill the beans',
  'en',
  'To reveal secret information accidentally or prematurely.',
  'Possibly from ancient Greek voting practices using beans, where spilling them would prematurely reveal the tally.',
  array['Don''t spill the beans about the surprise party!', 'He accidentally spilled the beans about the merger.'],
  array['secrets', 'disclosure', 'informal'],
  'human',
  'published'
),
(
  'Estar en las nubes',
  'es',
  'Estar distraído o no prestar atención a lo que está pasando alrededor.',
  'Las nubes evocan una distancia mental respecto al suelo, es decir, a la realidad — quien "está en las nubes" está ausente.',
  array['¡Presta atención! Estás en las nubes otra vez.', 'Durante toda la reunión estuvo en las nubes.'],
  array['distraction', 'daydreaming', 'informal'],
  'human',
  'published'
),
(
  'Irse de la lengua',
  'es',
  'Revelar accidentalmente algo que debía permanecer en secreto.',
  'Hace referencia a la lengua que "se escapa" del control — el habla se adelanta a la discreción.',
  array['Se fue de la lengua y contó todo el plan.', 'No le digas nada, siempre se va de la lengua.'],
  array['secrets', 'disclosure', 'informal'],
  'human',
  'published'
);

-- ── Translations ─────────────────────────────────────────────────────────
-- EN idioms → ES (and a sprinkle of FR to exercise multi-language shape)

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Rómpete una pierna',
  'Forma supersticiosa de desear buena suerte, sobre todo antes de una actuación.',
  'Se cree que viene del teatro de principios del siglo XX, donde desear "buena suerte" directamente traía mala suerte.',
  'ai_mined'
from public.idioms i where i.expression = 'Break a leg' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'fr',
  'Casse-toi une jambe',
  'Façon superstitieuse de souhaiter bonne chance, surtout avant une représentation.',
  'Probablement originaire du théâtre du début du XXe siècle, où souhaiter directement "bonne chance" portait malheur.',
  'ai_mined'
from public.idioms i where i.expression = 'Break a leg' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Morder la bala',
  'Soportar una situación dolorosa o desagradable que es inevitable.',
  'Históricamente, a los soldados se les daba una bala de plomo para morder durante una cirugía antes de la anestesia.',
  'ai_mined'
from public.idioms i where i.expression = 'Bite the bullet' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Dar en el clavo',
  'Describir exactamente lo que causa una situación o problema.',
  'De la carpintería — golpear un clavo justo en la cabeza lo clava limpiamente; un golpe oblicuo lo dobla.',
  'ai_mined'
from public.idioms i where i.expression = 'Hit the nail on the head' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Bajo el clima',
  'Sentirse mal o con poca salud.',
  'Expresión náutica — un marinero enfermo bajaba bajo cubierta para refugiarse del mal tiempo, de ahí "bajo el clima".',
  'ai_mined'
from public.idioms i where i.expression = 'Under the weather' and i.language_code = 'en';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'es',
  'Derramar los frijoles',
  'Revelar información secreta de forma accidental o prematura.',
  'Posiblemente de prácticas de votación de la antigua Grecia con frijoles, donde derramarlos revelaba el recuento antes de tiempo.',
  'ai_mined'
from public.idioms i where i.expression = 'Spill the beans' and i.language_code = 'en';

-- ES idioms → EN

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'en',
  'To be in the clouds',
  'To be daydreaming or not paying attention to what is happening.',
  'Clouds evoke a mental distance from the ground — i.e. reality. Someone "in the clouds" is absent-minded.',
  'ai_mined'
from public.idioms i where i.expression = 'Estar en las nubes' and i.language_code = 'es';

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, 'en',
  'To go off the tongue',
  'To accidentally reveal something that was supposed to stay secret.',
  'Refers to the tongue "escaping" control — speech running ahead of discretion.',
  'ai_mined'
from public.idioms i where i.expression = 'Irse de la lengua' and i.language_code = 'es';

-- ── Cross-language equivalent with similarity score ──────────────────────
-- "Spill the beans" (en) ↔ "Irse de la lengua" (es) — very close, 0.92.
insert into public.idiom_equivalents (idiom_id_a, idiom_id_b, verified, similarity_score)
select
  least(en.id, es.id),
  greatest(en.id, es.id),
  true,
  0.92
from
  (select id from public.idioms where expression = 'Spill the beans' and language_code = 'en') en,
  (select id from public.idioms where expression = 'Irse de la lengua' and language_code = 'es') es;
