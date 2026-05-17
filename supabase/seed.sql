-- Seed: a curated subset of the corpus (10 idioms across EN/ES/FR/DE) with
-- translations, canonical tags, and verified cross-language equivalents.
-- Local-only — the GH workflow does not apply this to prod.
--
-- Content was pulled from the mining pipeline's enriched output. To refresh:
-- restore /tmp/seed-dump.sql to local, then re-run /tmp/gen-seed.sql.

-- ── Native-language idioms ───────────────────────────────────────────────

insert into public.idioms
  (expression, language_code, idiomatic_meaning, explanation, examples, source, status)
values
(
  'In den sauren Apfel beißen',
  'de',
  'Etwas Unangenehmes oder Schwieriges akzeptieren oder durchstehen müssen, oft um langfristig einen Vorteil zu erreichen.',
  'Der Ausdruck stammt vermutlich aus der Vorstellung, dass ein saurer Apfel nicht angenehm zu essen ist, aber man ihn dennoch essen muss, um seine Nährstoffe zu nutzen.',
  array['Ich musste in den sauren Apfel beißen und meine Steuererklärung machen.', 'Es war schwer, sich von alten Gewohnheiten zu trennen, aber ich wusste, ich musste in den sauren Apfel beißen.', 'Manchmal muss man in den sauren Apfel beißen, um die eigene Gesundheit zu verbessern.'],
  'ai_mined',
  'published'
),
(
  'Bite the bullet',
  'en',
  'To face a difficult or unpleasant situation with courage and determination.',
  'The phrase originates from the practice of having soldiers bite on bullets during surgery to endure pain, hence implying facing a tough situation head-on.',
  array['I didn''t want to go to the dentist, but I had to bite the bullet and make an appointment.', 'When the company announced layoffs, I knew I had to bite the bullet and start looking for a new job.', 'She didn''t want to move away from her friends, but she decided to bite the bullet for her career.'],
  'ai_mined',
  'published'
),
(
  'Break a leg',
  'en',
  'Wishing someone good luck, especially before a performance.',
  'This expression is thought to have originated in the theater world, where saying ''good luck'' is considered bad luck. Instead, performers say ''break a leg'' as a way to impart positive wishes without invoking bad fortune.',
  array['Before she went on stage, her friends told her to break a leg.', 'I have a big presentation tomorrow, so please break a leg for me!', 'When he auditioned for the role, his mother reminded him to break a leg.'],
  'ai_mined',
  'published'
),
(
  'Hit the nail on the head',
  'en',
  'To describe exactly what is causing a situation or problem. It means to get something precisely right.',
  'The phrase likely originates from carpentry, where hitting a nail on the head refers to driving it in correctly. It emphasizes accuracy and precision in thought or action.',
  array['When she suggested that poor communication was the issue, she really hit the nail on the head.', 'His analysis of the company''s financial troubles hit the nail on the head, identifying the main flaw in their strategy.', 'After listening to the team''s concerns, the manager hit the nail on the head with his proposed solutions.'],
  'ai_mined',
  'published'
),
(
  'Spill the beans',
  'en',
  'To reveal a secret or disclose confidential information.',
  'The origin of this idiom is believed to stem from an ancient voting system in which beans were used to cast votes. If someone spilled the beans, the votes were revealed prematurely, thus disclosing the outcome before it was intended.',
  array['I finally got her to spill the beans about the surprise party.', 'He accidentally spilled the beans about the promotion before it was announced.', 'Don''t spill the beans about our project until we finish it.'],
  'ai_mined',
  'published'
),
(
  'Under the weather',
  'en',
  'Feeling unwell or sick, often with mild symptoms like a cold.',
  'The phrase is believed to have maritime origins, referring to sailors who would feel ill due to bad weather. Being ''under the weather'' implies that one''s health is impacted by external conditions, much like how sailors were affected by storms.',
  array['I think I''ll stay home today; I''m feeling a bit under the weather.', 'She seemed under the weather during the meeting and didn''t participate much.', 'It''s normal to feel under the weather after a long trip.'],
  'ai_mined',
  'published'
),
(
  'Estar en las nubes',
  'es',
  'Estar distraído o no prestar atención a lo que está pasando alrededor.',
  'Las nubes evocan una distancia mental respecto al suelo, es decir, a la realidad — quien "está en las nubes" está ausente.',
  array['¡Presta atención! Estás en las nubes otra vez.', 'Durante toda la reunión estuvo en las nubes.'],
  'human',
  'published'
),
(
  'Hacer de tripas corazón',
  'es',
  'Hacer un gran esfuerzo para enfrentar una situación difícil o dolorosa, a pesar del miedo o la angustia que siente.',
  'Esta expresión proviene de la idea de que, al hacer algo valiente o decididido, alguien tiene que hacer un esfuerzo consciente para superar sus sentimientos de miedo o desánimo, como si estuviera transformando algo desagradable (''tripas'') en un acto de valentía (''corazón'').',
  array['A pesar de su miedo escénico, hizo de tripas corazón y se subió al escenario a hablar.', 'Sabía que la conversación sería difícil, pero decidió hacer de tripas corazón y enfrentarla de una vez.', 'Cuando le dijeron que tenía que mudarse por trabajo, hizo de tripas corazón y aceptó la situación.'],
  'ai_mined',
  'published'
),
(
  'Irse de la lengua',
  'es',
  'Revelar accidentalmente algo que debía permanecer en secreto.',
  'Hace referencia a la lengua que "se escapa" del control — el habla se adelanta a la discreción.',
  array['Se fue de la lengua y contó todo el plan.', 'No le digas nada, siempre se va de la lengua.'],
  'human',
  'published'
),
(
  'Prendre son courage à deux mains',
  'fr',
  'Rassembler tout son courage pour faire quelque chose de difficile ou d''effrayant.',
  'Image d''empoigner son courage fermement, comme on saisirait un objet à deux mains pour ne pas le laisser tomber. Attestée depuis le XVIIe siècle.',
  array['Elle a pris son courage à deux mains et a démissionné.', 'Prends ton courage à deux mains et appelle-le.'],
  'human',
  'published'
);

-- ── Translations ─────────────────────────────────────────────────────────

insert into public.idiom_translations
  (idiom_id, language_code, literal_translation, idiomatic_meaning, explanation, source)
select i.id, v.language_code, v.literal_translation, v.idiomatic_meaning, v.explanation, v.source
from public.idioms i
join (values
  ('In den sauren Apfel beißen', 'de', 'en', 'To bite into the sour apple', 'To take on an unpleasant but unavoidable task.', 'Literally "to bite into the sour apple" — to swallow something disagreeable. Attested since Luther''s time (16th century) as an image of reluctant endurance.', 'ai_mined'),
  ('In den sauren Apfel beißen', 'de', 'es', 'Morder la manzana ácida', 'Asumir una tarea desagradable pero inevitable.', 'Literalmente "morder la manzana ácida" — tragar algo desagradable. Atestiguada desde la época de Lutero (siglo XVI) como imagen de aguante a regañadientes.', 'ai_mined'),
  ('In den sauren Apfel beißen', 'de', 'fr', 'Mordre dans la pomme acide', 'S''attaquer à une tâche désagréable mais inévitable.', 'Littéralement "mordre dans la pomme acide" — avaler quelque chose de désagréable. Attestée depuis l''époque de Luther (XVIe siècle) comme image d''une endurance résignée.', 'ai_mined'),
  ('Bite the bullet', 'en', 'de', 'In die Kugel beißen', 'Eine schwierige oder unangenehme Situation mit Mut und Entschlossenheit angehen.', '', 'ai_mined'),
  ('Bite the bullet', 'en', 'es', 'Morder la bala', 'Soportar una situación dolorosa o desagradable que es inevitable.', 'Históricamente, a los soldados se les daba una bala de plomo para morder durante una cirugía antes de la anestesia.', 'ai_mined'),
  ('Bite the bullet', 'en', 'fr', 'Mordre la balle', 'Faire face à une situation difficile ou désagréable avec courage et détermination.', '', 'ai_mined'),
  ('Break a leg', 'en', 'de', 'Breiß ein Bein', 'Jemandem viel Glück wünschen, besonders vor einer Aufführung.', '', 'ai_mined'),
  ('Break a leg', 'en', 'es', 'Rómpete una pierna', 'Forma supersticiosa de desear buena suerte, sobre todo antes de una actuación.', 'Se cree que viene del teatro de principios del siglo XX, donde desear "buena suerte" directamente traía mala suerte.', 'ai_mined'),
  ('Break a leg', 'en', 'fr', 'Casse-toi une jambe', 'Façon superstitieuse de souhaiter bonne chance, surtout avant une représentation.', 'Probablement originaire du théâtre du début du XXe siècle, où souhaiter directement "bonne chance" portait malheur.', 'ai_mined'),
  ('Hit the nail on the head', 'en', 'de', 'Den Nagel auf den Kopf treffen', 'Genau das Problem oder die Ursache einer Situation erkennen.', '', 'ai_mined'),
  ('Hit the nail on the head', 'en', 'es', 'Dar en el clavo', 'Describir exactamente lo que causa una situación o problema.', 'De la carpintería — golpear un clavo justo en la cabeza lo clava limpiamente; un golpe oblicuo lo dobla.', 'ai_mined'),
  ('Hit the nail on the head', 'en', 'fr', 'Frapper le clou sur la tête', 'Décrire exactement ce qui cause une situation ou un problème. Cela signifie avoir raison sur un sujet précis.', '', 'ai_mined'),
  ('Spill the beans', 'en', 'de', 'Die Bohnen verschütten', 'Ein Geheimnis verraten oder vertrauliche Informationen offenbaren.', '', 'ai_mined'),
  ('Spill the beans', 'en', 'es', 'Derramar los frijoles', 'Revelar información secreta de forma accidental o prematura.', 'Posiblemente de prácticas de votación de la antigua Grecia con frijoles, donde derramarlos revelaba el recuento antes de tiempo.', 'ai_mined'),
  ('Spill the beans', 'en', 'fr', 'Renverser les haricots', 'Révéler un secret ou divulguer des informations confidentielles.', '', 'ai_mined'),
  ('Under the weather', 'en', 'de', 'Unter dem Wetter', 'Sich unwohl oder krank fühlen, oft mit milden Symptomen wie einer Erkältung.', '', 'ai_mined'),
  ('Under the weather', 'en', 'es', 'Bajo el clima', 'Sentirse mal o con poca salud.', 'Expresión náutica — un marinero enfermo bajaba bajo cubierta para refugiarse del mal tiempo, de ahí "bajo el clima".', 'ai_mined'),
  ('Under the weather', 'en', 'fr', 'Sous le temps', 'Se sentir mal ou malade, souvent avec des symptômes légers comme un rhume.', '', 'ai_mined'),
  ('Estar en las nubes', 'es', 'de', 'In den Wolken sein', 'Ablenkung oder Unaufmerksamkeit gegenüber dem, was um einen herum passiert.', '', 'ai_mined'),
  ('Estar en las nubes', 'es', 'en', 'To be in the clouds', 'To be daydreaming or not paying attention to what is happening.', 'Clouds evoke a mental distance from the ground — i.e. reality. Someone "in the clouds" is absent-minded.', 'ai_mined'),
  ('Estar en las nubes', 'es', 'fr', 'Être dans les nuages', 'Être distrait ou ne pas prêter attention à ce qui se passe autour.', '', 'ai_mined'),
  ('Hacer de tripas corazón', 'es', 'de', 'Aus Eingeweiden ein Herz machen', 'Sich Mut antun, um eine schwierige oder unangenehme Lage zu meistern.', 'Wörtlich "aus den Eingeweiden ein Herz machen" — die Eingeweide (volkstümlich Sitz der Angst) in Herz (Mut) verwandeln. Belegt seit dem spanischen Goldenen Zeitalter.', 'ai_mined'),
  ('Hacer de tripas corazón', 'es', 'en', 'To make heart out of guts', 'To steel oneself to face a difficult or unpleasant situation.', 'Literally "to make a heart out of one''s guts" — turning the viscera (folkloric seat of fear) into a heart (courage). Attested from the Spanish Golden Age.', 'ai_mined'),
  ('Hacer de tripas corazón', 'es', 'fr', 'Faire un cœur de tripes', 'Se forcer au courage pour affronter une situation difficile ou désagréable.', 'Littéralement "faire un cœur avec les tripes" — transformer les viscères (siège populaire de la peur) en cœur (courage). Attestée depuis le Siècle d''or espagnol.', 'ai_mined'),
  ('Irse de la lengua', 'es', 'de', 'Von der Zunge gehen', 'Etwas versehentlich verraten, das geheim bleiben sollte.', '', 'ai_mined'),
  ('Irse de la lengua', 'es', 'en', 'To go off the tongue', 'To accidentally reveal something that was supposed to stay secret.', 'Refers to the tongue "escaping" control — speech running ahead of discretion.', 'ai_mined'),
  ('Irse de la lengua', 'es', 'fr', 'Partir de la langue', 'Révéler accidentellement quelque chose qui devait rester secret.', '', 'ai_mined'),
  ('Prendre son courage à deux mains', 'fr', 'de', 'Seinen Mut mit beiden Händen ergreifen', 'Allen Mut zusammennehmen, um etwas Schwieriges oder Beängstigendes zu tun.', 'Bild des festen Zugreifens nach dem eigenen Mut, wie man einen Gegenstand mit beiden Händen hält, um ihn nicht fallen zu lassen. Belegt seit dem 17. Jahrhundert.', 'ai_mined'),
  ('Prendre son courage à deux mains', 'fr', 'en', 'To take one''s courage in both hands', 'To gather up all one''s courage to do something hard or scary.', 'Image of gripping one''s courage firmly, as one would grasp an object with both hands to avoid dropping it. Attested since the 17th century.', 'ai_mined'),
  ('Prendre son courage à deux mains', 'fr', 'es', 'Tomar el valor con las dos manos', 'Reunir todo el valor para hacer algo difícil o que da miedo.', 'Imagen de agarrar el propio valor con firmeza, como se sujetaría un objeto con ambas manos para no dejarlo caer. Atestiguada desde el siglo XVII.', 'ai_mined')
) as v(expression, parent_lang, language_code, literal_translation, idiomatic_meaning, explanation, source)
  on v.expression = i.expression and v.parent_lang = i.language_code;

-- ── Non-canonical tags referenced by this seed ───────────────────────────
-- These tag keys are not in the canonical migration (20260511070000) but
-- the pipeline has been producing them. ON CONFLICT keeps things idempotent.

insert into public.tags (key, facet) values
  ('accuracy', 'meaning'),
  ('courage', 'meaning'),
  ('daydreaming', 'meaning'),
  ('disclosure', 'meaning'),
  ('distraction', 'meaning'),
  ('endurance', 'meaning'),
  ('formal', 'register'),
  ('health', 'theme'),
  ('illness', 'theme'),
  ('informal', 'register'),
  ('insight', 'meaning'),
  ('luck', 'meaning'),
  ('secrets', 'theme'),
  ('theater', 'context')
on conflict (key) do nothing;

-- EN labels for the same set (idempotent).
insert into public.tag_translations (tag_id, language_code, label)
select t.id, 'en', initcap(t.key)
from public.tags t
where t.key in (
  'accuracy',
  'courage',
  'daydreaming',
  'disclosure',
  'distraction',
  'endurance',
  'formal',
  'health',
  'illness',
  'informal',
  'insight',
  'luck',
  'secrets',
  'theater'
)
on conflict (tag_id, language_code) do nothing;

-- ── Tag links ────────────────────────────────────────────────────────────

insert into public.idiom_tags (idiom_id, tag_id)
select i.id, t.id
from public.idioms i
join (values
  ('In den sauren Apfel beißen', 'de', 'courage'),
  ('In den sauren Apfel beißen', 'de', 'endurance'),
  ('In den sauren Apfel beißen', 'de', 'informal'),
  ('Bite the bullet', 'en', 'courage'),
  ('Bite the bullet', 'en', 'endurance'),
  ('Bite the bullet', 'en', 'formal'),
  ('Break a leg', 'en', 'informal'),
  ('Break a leg', 'en', 'luck'),
  ('Break a leg', 'en', 'theater'),
  ('Hit the nail on the head', 'en', 'accuracy'),
  ('Hit the nail on the head', 'en', 'informal'),
  ('Hit the nail on the head', 'en', 'insight'),
  ('Spill the beans', 'en', 'disclosure'),
  ('Spill the beans', 'en', 'informal'),
  ('Spill the beans', 'en', 'secrets'),
  ('Under the weather', 'en', 'health'),
  ('Under the weather', 'en', 'illness'),
  ('Under the weather', 'en', 'informal'),
  ('Estar en las nubes', 'es', 'daydreaming'),
  ('Estar en las nubes', 'es', 'distraction'),
  ('Estar en las nubes', 'es', 'informal'),
  ('Hacer de tripas corazón', 'es', 'courage'),
  ('Hacer de tripas corazón', 'es', 'endurance'),
  ('Hacer de tripas corazón', 'es', 'informal'),
  ('Irse de la lengua', 'es', 'disclosure'),
  ('Irse de la lengua', 'es', 'informal'),
  ('Irse de la lengua', 'es', 'secrets'),
  ('Prendre son courage à deux mains', 'fr', 'courage'),
  ('Prendre son courage à deux mains', 'fr', 'endurance'),
  ('Prendre son courage à deux mains', 'fr', 'informal')
) as v(expression, language_code, tag_key)
  on v.expression = i.expression and v.language_code = i.language_code
join public.tags t on t.key = v.tag_key;

-- ── Verified cross-language equivalents ──────────────────────────────────

insert into public.idiom_equivalents (idiom_id_a, idiom_id_b, verified, similarity_score)
select least(a.id, b.id), greatest(a.id, b.id), true, v.score
from public.idioms a
join (values
  ('Bite the bullet', 'en', 'Hacer de tripas corazón', 'es', 0.70),
  ('In den sauren Apfel beißen', 'de', 'Bite the bullet', 'en', 0.70),
  ('Prendre son courage à deux mains', 'fr', 'Bite the bullet', 'en', 0.75),
  ('Spill the beans', 'en', 'Irse de la lengua', 'es', 0.92)
) as v(a_expr, a_lang, b_expr, b_lang, score)
  on v.a_expr = a.expression and v.a_lang = a.language_code
join public.idioms b on v.b_expr = b.expression and v.b_lang = b.language_code;
