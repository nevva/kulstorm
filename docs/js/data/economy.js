'use strict';
// XP dropped per enemy type, and the coin cost of squad levels in the buy screen.
// Pure data: no three.js, DOM or game state. Carry these over as-is when porting to another engine.
const XP_VAL={shambler:1,crawler:1,bloater:3,knight:3,splitter:1,mole:2,necro:4,charger:4,blob:1,runner:1,swarm:1,wolf:1,bats:1,ghost:2,shooter:2,bomber:2,tank:5,spiderling:1,boss:25};
const LVL_COST=[0,10,20,35,55];
// Coin price of a hero talent point when you have no free one, by how many you have bought before.
const TALENT_COST=b=>40+20*b;
