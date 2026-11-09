/* Atomic North — reference data (element facts are standard published values, rounded) */
window.AN = window.AN || {};

AN.ELEMENTS = (function () {
  const names = "H Hydrogen,He Helium,Li Lithium,Be Beryllium,B Boron,C Carbon,N Nitrogen,O Oxygen,F Fluorine,Ne Neon,Na Sodium,Mg Magnesium,Al Aluminum,Si Silicon,P Phosphorus,S Sulfur,Cl Chlorine,Ar Argon,K Potassium,Ca Calcium,Sc Scandium,Ti Titanium,V Vanadium,Cr Chromium,Mn Manganese,Fe Iron,Co Cobalt,Ni Nickel,Cu Copper,Zn Zinc,Ga Gallium,Ge Germanium,As Arsenic,Se Selenium,Br Bromine,Kr Krypton,Rb Rubidium,Sr Strontium,Y Yttrium,Zr Zirconium,Nb Niobium,Mo Molybdenum,Tc Technetium,Ru Ruthenium,Rh Rhodium,Pd Palladium,Ag Silver,Cd Cadmium,In Indium,Sn Tin,Sb Antimony,Te Tellurium,I Iodine,Xe Xenon,Cs Cesium,Ba Barium,La Lanthanum,Ce Cerium,Pr Praseodymium,Nd Neodymium,Pm Promethium,Sm Samarium,Eu Europium,Gd Gadolinium,Tb Terbium,Dy Dysprosium,Ho Holmium,Er Erbium,Tm Thulium,Yb Ytterbium,Lu Lutetium,Hf Hafnium,Ta Tantalum,W Tungsten,Re Rhenium,Os Osmium,Ir Iridium,Pt Platinum,Au Gold,Hg Mercury,Tl Thallium,Pb Lead,Bi Bismuth,Po Polonium,At Astatine,Rn Radon,Fr Francium,Ra Radium,Ac Actinium,Th Thorium,Pa Protactinium,U Uranium,Np Neptunium,Pu Plutonium,Am Americium,Cm Curium,Bk Berkelium,Cf Californium,Es Einsteinium,Fm Fermium,Md Mendelevium,No Nobelium,Lr Lawrencium,Rf Rutherfordium,Db Dubnium,Sg Seaborgium,Bh Bohrium,Hs Hassium,Mt Meitnerium,Ds Darmstadtium,Rg Roentgenium,Cn Copernicium,Nh Nihonium,Fl Flerovium,Mc Moscovium,Lv Livermorium,Ts Tennessine,Og Oganesson".split(",");
  const mass = [1.008,4.003,6.94,9.012,10.81,12.01,14.01,16.00,19.00,20.18,22.99,24.31,26.98,28.09,30.97,32.07,35.45,39.95,39.10,40.08,44.96,47.87,50.94,52.00,54.94,55.85,58.93,58.69,63.55,65.38,69.72,72.63,74.92,78.97,79.90,83.80,85.47,87.62,88.91,91.22,92.91,95.95,98,101.07,102.91,106.42,107.87,112.41,114.82,118.71,121.76,127.60,126.90,131.29,132.91,137.33];
  const extraMass = {74:183.84,78:195.08,79:196.97,80:200.59,82:207.2,83:208.98,86:222,88:226,92:238.03,94:244};
  // [atomic radius pm, first ionization energy kJ/mol, electronegativity]
  const trend = {1:[37,1312,2.20],2:[32,2372,null],3:[152,520,0.98],4:[112,900,1.57],5:[85,801,2.04],6:[77,1086,2.55],7:[75,1402,3.04],8:[73,1314,3.44],9:[72,1681,3.98],10:[71,2081,null],11:[186,496,0.93],12:[160,738,1.31],13:[143,578,1.61],14:[118,787,1.90],15:[110,1012,2.19],16:[103,1000,2.58],17:[99,1251,3.16],18:[98,1521,null],19:[227,419,0.82],20:[197,590,1.00],21:[162,633,1.36],22:[147,659,1.54],23:[134,651,1.63],24:[128,653,1.66],25:[127,717,1.55],26:[126,762,1.83],27:[125,760,1.88],28:[124,737,1.91],29:[128,745,1.90],30:[134,906,1.65],31:[135,579,1.81],32:[122,762,2.01],33:[119,947,2.18],34:[116,941,2.55],35:[114,1140,2.96],36:[112,1351,3.00],37:[248,403,0.82],38:[215,550,0.95],53:[133,1008,2.66],54:[131,1170,2.60],55:[265,376,0.79],56:[222,503,0.89]};
  const cat = z => {
    if ([3,11,19,37,55,87].includes(z)) return "alkali";
    if ([4,12,20,38,56,88].includes(z)) return "alkaline";
    if ([9,17,35,53,85,117].includes(z)) return "halogen";
    if ([2,10,18,36,54,86,118].includes(z)) return "noble";
    if ([5,14,32,33,51,52].includes(z)) return "metalloid";
    if ([1,6,7,8,15,16,34].includes(z)) return "nonmetal";
    if (z >= 57 && z <= 71) return "lanth";
    if (z >= 89 && z <= 103) return "act";
    if ((z>=21&&z<=30)||(z>=39&&z<=48)||(z>=72&&z<=80)||(z>=104&&z<=112)) return "transition";
    return "post";
  };
  const pos = z => { // returns [row, col] (1-based); rows 9,10 = f-block
    if (z === 1) return [1, 1]; if (z === 2) return [1, 18];
    const block = (start, period) => {
      const i = z - start;
      if (period <= 3) return [period, i < 2 ? i + 1 : i + 11];
      if (period <= 5) return [period, i + 1];
      if (i < 2) return [period, i + 1];
      if (i <= 16) return [period + 3, i + 1]; // f-block row, cols 3..17
      return [period, i - 13];
    };
    if (z <= 10) return block(3, 2); if (z <= 18) return block(11, 3);
    if (z <= 36) return block(19, 4); if (z <= 54) return block(37, 5);
    if (z <= 86) return block(55, 6); return block(87, 7);
  };
  return names.map((s, i) => {
    const z = i + 1, [sym, name] = s.split(" ");
    const [row, col] = pos(z);
    const t = trend[z] || [null, null, null];
    let period = row > 7 ? row - 3 : row;
    return { z, sym, name, mass: mass[i] ?? extraMass[z] ?? null, cat: cat(z), row, col, period,
      group: row > 7 ? null : col, radius: t[0], ie: t[1], en: t[2] };
  });
})();
AN.el = s => AN.ELEMENTS.find(e => e.sym === s || e.z === s);
AN.CAT_LABEL = { alkali: "Alkali metal", alkaline: "Alkaline earth metal", transition: "Transition metal", post: "Other metal", metalloid: "Metalloid", nonmetal: "Nonmetal", halogen: "Halogen", noble: "Noble gas", lanth: "Lanthanide", act: "Actinide" };

/* electrons per energy level (Bohr model, Z <= 20) */
AN.shells = z => { const out = []; let left = z; for (const cap of [2, 8, 8, 2]) { if (left <= 0) break; const n = Math.min(cap, left); out.push(n); left -= n; } return out; };

AN.FLAMES = [
  { sym: "Li", compound: "lithium chloride", colour: "crimson red", c1: "#E0213A", c2: "#FF6B7A" },
  { sym: "Na", compound: "sodium chloride", colour: "bright yellow-orange", c1: "#FFB000", c2: "#FFE066" },
  { sym: "K", compound: "potassium chloride", colour: "lilac (pale violet)", c1: "#B57BEA", c2: "#E3C8FF" },
  { sym: "Ca", compound: "calcium chloride", colour: "orange-red (brick red)", c1: "#F2541B", c2: "#FF9A5E" },
  { sym: "Sr", compound: "strontium chloride", colour: "scarlet red", c1: "#E8001C", c2: "#FF4D5E" },
  { sym: "Ba", compound: "barium chloride", colour: "pale yellow-green", c1: "#9BCF2E", c2: "#D7F27A" },
  { sym: "Cu", compound: "copper(II) chloride", colour: "blue-green", c1: "#12B5A6", c2: "#6FE3D3" }
];

AN.ISOTOPES = [
  { id: "I131", label: "Iodine-131", half: 8.0, unit: "days", use: "treats thyroid problems" },
  { id: "Co60", label: "Cobalt-60", half: 5.27, unit: "years", use: "cancer radiation therapy" },
  { id: "C14", label: "Carbon-14", half: 5730, unit: "years", use: "dates once-living material" },
  { id: "Tc99m", label: "Technetium-99m", half: 6.0, unit: "hours", use: "medical imaging" }
];
