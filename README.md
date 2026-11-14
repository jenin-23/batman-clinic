# Batman Clinic — Vet Simulator

A 3D veterinary clinic simulation (dogs, cats, birds, rabbits, tortoises) with scientifically accurate exams, anaesthesia, aseptic preparation, surgery, pharmacology, lab work and dentistry — built with Three.js. Play it in any browser, including iPhone and iPad.

**Play:** https://jenin-23.github.io/batman-clinic/

- No account needed. Progress is saved in the browser; export a backup file from the office to move it between devices or versions.
- Keyboard: WASD/arrows, E interact, V first/third person, P photo, O settings, H help. Touch: D-pad + Interact.

## Structure
- `js/data.js` — clinical content (species vitals, cases, procedures, instruments, drugs, labs, dental, quiz bank)
- `js/world.js` — Three.js clinic, characters, pets, camera
- `js/minigames.js` — hands-on canvas tasks
- `js/game.js` / `js/systems.js` — game flow, economy, staff, events, story, backups
