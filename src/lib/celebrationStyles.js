// The wall's celebration styles, for the Settings › Celebrations screen.
// (The looks themselves live in src/wall/Celebration*.jsx; these ids match.)
export const CELEBRATION_GROUPS = [
  {
    title: 'Classics',
    styles: [
      ['banner', 'Banner', 'House banner, confetti and fireworks'],
      ['lasers', 'Lasers', 'Laser beams and neon'],
      ['comic', 'Comic', 'KAPOW! burst and speech bubble'],
      ['magic', 'Magic', 'Starry night and sparkles'],
      ['pixel', 'Pixel', '8-bit LEVEL UP!'],
      ['eighties', "'80s", 'Neon grid and sunset'],
      ['race', 'Race', 'Chequered flags and a podium'],
      ['hero', 'Action Hero', 'Movie explosion'],
    ],
  },
  {
    title: 'Themes',
    styles: [
      ['macho', 'Wrestling', 'Title belt and OHHH YEAH!'],
      ['construction', 'Construction', 'Crane and steel beam'],
      ['hawaii', 'Hawaii', 'Sunset, palms and a lei'],
      ['soccer', 'Soccer', 'GOOOOAL! and a scoreboard'],
      ['golf', 'Golf', 'A putt and a leaderboard'],
      ['kpop', 'K-pop', 'Light sticks and hearts'],
      ['irish', 'Irish Jig', 'Rainbow and pot of gold'],
      ['rock', 'Rock and Roll', 'Speakers, lightning and fire'],
    ],
  },
  {
    title: 'More Themes',
    styles: [
      ['ninja', 'Ninja', 'Rooftops, moon and shurikens'],
      ['glam', 'Glam', 'Hot pink and glitter'],
      ['dogs', 'Dogs', 'A happy pup, bones and paws'],
      ['atomic', 'Atomic', 'Cartoon mushroom cloud'],
      ['robots', 'Robots', 'Blinking robot and gears'],
      ['turbo', 'Turbo Track', 'Track loop and a racing car'],
      ['mountain', 'Mountain', 'Flag on the summit'],
      ['zombies', 'Zombies', 'Graveyard, hands and bats'],
    ],
  },
]

export const ALL_CELEBRATION_STYLES = CELEBRATION_GROUPS.flatMap((g) => g.styles.map(([id]) => id))
