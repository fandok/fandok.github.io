import { useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
  type SortingFn,
  type SortingState,
} from '@tanstack/react-table'
import styles from './SeaKickoffRosters.module.css'

type Status = 'Confirmed' | 'Likely' | 'Possible' | 'Unclear' | 'Not found'
type Role = 'Main' | 'Substitute'
/** One vlr.gg profile that may belong to this player, with its teams (most recent first). */
type VlrCandidate = { url: string; teams?: string }
type Player = {
  team: string
  role: Role
  /** Riot ID as registered for the event. */
  player: string
  status: Status
  vlr?: VlrCandidate[]
  liquipedia?: string
  notes: string
}

const STATUSES: Status[] = ['Confirmed', 'Likely', 'Possible', 'Unclear', 'Not found']

const STATUS_HINT: Record<Status, string> = {
  Confirmed: 'Liquipedia page, or vlr.gg already lists them under this team',
  Likely: 'Indonesian profile that shares a past team with a teammate',
  Possible: 'Only one Indonesian same-name profile, nothing ties it to the team',
  Unclear: 'Several same-name candidates, can’t tell which',
  'Not found': 'No matching vlr.gg or Liquipedia profile',
}

// Source: SEA Kickoff Indonesia roster cross-check (Riot IDs vs vlr.gg and Liquipedia).
const players: Player[] = [
  { team: "AimStar", role: "Main", player: "FIRE67#JEPE", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "AimStar", role: "Main", player: "angy tabby cat#annie", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "AimStar", role: "Main", player: "sonn#WIL", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "AimStar", role: "Main", player: "Justhistory#enryu", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/37084", teams: "Svvagy FC / Arcane" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "AimStar", role: "Main", player: "Mashlee#burnD", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "AimStar", role: "Substitute", player: "GEEK BeYours#GEEK", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/10805" }], liquipedia: "https://liquipedia.net/valorant/BeYours", notes: "Has a Liquipedia page; vlr.gg ID taken from Liquipedia" },
  { team: "ALTER EGO X KERTANEGARA", role: "Main", player: "AEKN ray4c", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/11666", teams: "Alter Ego x Kertanegar / Alter Ego / Vyres Esports" }], liquipedia: "https://liquipedia.net/valorant/Ray4c", notes: "Has a Liquipedia page" },
  { team: "ALTER EGO X KERTANEGARA", role: "Main", player: "AEKN gotten", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/23710", teams: "Alter Ego x Kertanegar / Kertanegara Esports / Team Nemesis" }], liquipedia: "https://liquipedia.net/valorant/Gotten", notes: "Has a Liquipedia page" },
  { team: "ALTER EGO X KERTANEGARA", role: "Main", player: "AEKN Nakya", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/16852", teams: "Alter Ego x Kertanegar / BOOM Esports / Indonesia" }], liquipedia: "https://liquipedia.net/valorant/Nakya", notes: "Has a Liquipedia page" },
  { team: "ALTER EGO X KERTANEGARA", role: "Main", player: "AEKN Shiro", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/10739", teams: "BOOM Esports / ONIC G" }], liquipedia: "https://liquipedia.net/valorant/Shiro_(Indonesian_player)", notes: "Has a Liquipedia page; 7 same-name profile(s) from other countries ignored" },
  { team: "ALTER EGO X KERTANEGARA", role: "Main", player: "AEKN BerserX", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/4874", teams: "Indonesia / Team Secret / BOOM Esports" }], liquipedia: "https://liquipedia.net/valorant/Berserx", notes: "Has a Liquipedia page" },
  { team: "Amity Voyage", role: "Main", player: "Alnando", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Amity Voyage", role: "Main", player: "Harun", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Amity Voyage", role: "Main", player: "Hafidz", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Amity Voyage", role: "Main", player: "Naldi", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Amity Voyage", role: "Main", player: "Willi", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/69098", teams: "Willi (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Amity Voyage", role: "Substitute", player: "Aditya", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Amity Voyage", role: "Substitute", player: "Dino", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/36892", teams: "Dino (International): Equinox / Beta Irons GC" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which; 5 same-name profile(s) from other countries ignored" },
  { team: "Astrum Deus", role: "Main", player: "NN VEEY#7520", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Astrum Deus", role: "Main", player: "Conqueror#Uang", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Astrum Deus", role: "Main", player: "MODUS75hz#rain", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Astrum Deus", role: "Main", player: "moB#Mir", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/43949", teams: "Mob (International): L9HAHAHA" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "Astrum Deus", role: "Main", player: "CallMeLidd#115", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Astrum Deus", role: "Substitute", player: "GAIA#alr", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "ATC", role: "Main", player: "HARILZA", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/23596", teams: "V6 esport / Team xixixi / Ayam" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "ATC", role: "Main", player: "Ratatuwi", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "ATC", role: "Main", player: "Bene", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/48781", teams: "ATC team / Dsternet Esports" }], notes: "vlr.gg already lists them under this team" },
  { team: "ATC", role: "Main", player: "Stecky", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "ATC", role: "Main", player: "Chard", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/34071", teams: "RDN TEAM / Ayam / V RAPTOR" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "AVAXY", role: "Main", player: "Sumaaa", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/63993", teams: "FLOWSTATE.GG" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "AVAXY", role: "Main", player: "Jimnembul1234567", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/61645", teams: "FLOWSTATE.GG" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "AVAXY", role: "Main", player: "Xaviour", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/51953", teams: "ABYSSAL FIREFLY / KROMATIC SHIRE / JINXPRO" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "AVAXY", role: "Main", player: "JIggez", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/61642", teams: "FLOWSTATE.GG" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "AVAXY", role: "Main", player: "Nichirin", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Bara Api Esports Vanquisher", role: "Main", player: "porsche gt3 rs#car", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bara Api Esports Vanquisher", role: "Main", player: "Naqydoz#000", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bara Api Esports Vanquisher", role: "Main", player: "garbear#1xx", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bara Api Esports Vanquisher", role: "Main", player: "kaoruko#jee", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Bara Api Esports Vanquisher", role: "Main", player: "stnzy#qqq", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Binus Achilles", role: "Main", player: "niveK", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/14009", teams: "nivek (International): StarlessGG" }, { url: "https://www.vlr.gg/player/45848", teams: "niveK (International): no teams" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "Binus Achilles", role: "Main", player: "Ken", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/58039", teams: "Ken (International): no teams" }, { url: "https://www.vlr.gg/player/56760", teams: "Ken (International): no teams" }, { url: "https://www.vlr.gg/player/11463", teams: "ken (Indonesia): Team Phenix / Pig Head" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 4 same-name profile(s) from other countries ignored" },
  { team: "Binus Achilles", role: "Main", player: "zwaenziii", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Binus Achilles", role: "Main", player: "shiroo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Binus Achilles", role: "Main", player: "Adin", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Binus Achilles", role: "Substitute", player: "zuh", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Main", player: "Frizzly#DTGL1", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Main", player: "Ryuukin#LIZ", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Main", player: "Shirayukii#white", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Main", player: "Ken#9005", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/58039", teams: "Ken (International): no teams" }, { url: "https://www.vlr.gg/player/56760", teams: "Ken (International): no teams" }, { url: "https://www.vlr.gg/player/11463", teams: "ken (Indonesia): Team Phenix / Pig Head" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 4 same-name profile(s) from other countries ignored" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Main", player: "AzeRex#Shiro", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Bismillah Juara, Mugkiiiiin", role: "Substitute", player: "malenia#eight", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "bONF1RE", role: "Main", player: "baoncik", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61496", teams: "bONF1RE" }], notes: "vlr.gg already lists them under this team" },
  { team: "bONF1RE", role: "Main", player: "floatinurboat", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "bONF1RE", role: "Main", player: "JO4VAN", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "bONF1RE", role: "Main", player: "Afyboy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "bONF1RE", role: "Main", player: "OWMEN", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Caesar Esport", role: "Main", player: "nfrenzy#7477", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Caesar Esport", role: "Main", player: "Reecow#RL2F", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Caesar Esport", role: "Main", player: "romi##eepy", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Caesar Esport", role: "Main", player: "JITU#nwfal", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Caesar Esport", role: "Main", player: "nevermine#blue", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/57068", teams: "VES LUMINOUS" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "Caesar Esport", role: "Substitute", player: "Kronikz#gntg", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "CIMMS", role: "Main", player: "StoicK#nath", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "CIMMS", role: "Main", player: "sonderson#fuza", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/44016", teams: "sonderson (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "CIMMS", role: "Main", player: "nouvelle vague#lune", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "CIMMS", role: "Main", player: "RBB#Cella", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/49404", teams: "C Fam" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "CIMMS", role: "Main", player: "沈勇江#Elvns", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "CIMMS", role: "Substitute", player: "huh yunjin#pobu", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/45471", teams: "HUH YUNJIN (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "club gokil", role: "Main", player: "renjet", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "club gokil", role: "Main", player: "ayrA", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/63990", teams: "Hive / Hive" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "club gokil", role: "Main", player: "Mhinxs", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "club gokil", role: "Main", player: "drover", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "club gokil", role: "Main", player: "PabrikSemut24", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Dare2Dream", role: "Main", player: "Qemetiel#bye", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Dare2Dream", role: "Main", player: "styX#LYNNN", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/44718", teams: "Styx (International): Tyrants" }, { url: "https://www.vlr.gg/player/23604", teams: "STYX (Indonesia): SyN TinG" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 4 same-name profile(s) from other countries ignored" },
  { team: "Dare2Dream", role: "Main", player: "deazpacito#sueño", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Dare2Dream", role: "Main", player: "ISSUES#HLGN", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Dare2Dream", role: "Main", player: "RTGRazor#777", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Dare2Dream", role: "Substitute", player: "PwinceOfToxic#udin", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DeadZone", role: "Main", player: "k a t y u s h a #malas", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DeadZone", role: "Main", player: "Mayonaka#mayoo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DeadZone", role: "Main", player: "Estarossa#White", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DeadZone", role: "Main", player: "kaii#1220", status: "Not found", notes: "Only same-name players from other countries (2)" },
  { team: "DeadZone", role: "Main", player: "QynLerra#Juken", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DNL ESPORT", role: "Main", player: "mozz1#Luna", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/56105", teams: "Exogen / ex EAID" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "DNL ESPORT", role: "Main", player: "vomero#CQN", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DNL ESPORT", role: "Main", player: "Joji#DNL", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/70484", teams: "joji (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "DNL ESPORT", role: "Main", player: "Zeux#naa", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DNL ESPORT", role: "Main", player: "nakirrr#elio", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "DNL ESPORT", role: "Substitute", player: "Micinn#DNL", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "dragonmilk", role: "Main", player: "pixelfern #ytube", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "dragonmilk", role: "Main", player: "gibranrakabuming #3jari", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "dragonmilk", role: "Main", player: "boootak #botak", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "dragonmilk", role: "Main", player: "G0dsen#8888", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "dragonmilk", role: "Main", player: "MannersMakethMan#ser", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "FrONEsis Esport", role: "Main", player: "Langg", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "FrONEsis Esport", role: "Main", player: "Isataa", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "FrONEsis Esport", role: "Main", player: "ZINK", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/58724", teams: "ZINK (International): no teams" }, { url: "https://www.vlr.gg/player/68158", teams: "Zink (International): no teams" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "FrONEsis Esport", role: "Main", player: "Siyaaalll", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "FrONEsis Esport", role: "Main", player: "Rapz", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/63982", teams: "RDN TEAM" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "GAS ESPORTS", role: "Main", player: "GAS PadangRice#2002", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/9280", teams: "GAS Esports / DIS Esports / BIGG Motley" }], notes: "vlr.gg already lists them under this team" },
  { team: "GAS ESPORTS", role: "Main", player: "GAS Kahlheit#odi", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/23686", teams: "GAS Esports / ANTASENA / Rudi Family" }], notes: "vlr.gg already lists them under this team" },
  { team: "GAS ESPORTS", role: "Main", player: "GAS umarosdios#csgo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GAS ESPORTS", role: "Main", player: "GAS 6ixkey#6key", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/26826", teams: "GAS Esports / ANTASENA / Rudi Family" }], notes: "vlr.gg already lists them under this team" },
  { team: "GAS ESPORTS", role: "Main", player: "GAS Movi#zelyn", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/16804", teams: "GAS Esports / Be Good / NEVERLAND713" }], notes: "vlr.gg already lists them under this team; 1 same-name profile(s) from other countries ignored" },
  { team: "GAS ESPORTS", role: "Substitute", player: "GAS Druckey#key", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GAS ESPORTS", role: "Substitute", player: "Livy#NCure", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GEKKOU ESPORTS", role: "Main", player: "Enandiz", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GEKKOU ESPORTS", role: "Main", player: "Adn9", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GEKKOU ESPORTS", role: "Main", player: "Rulership", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GEKKOU ESPORTS", role: "Main", player: "Fatlip", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/19844", teams: "fatlip (International): no teams" }, { url: "https://www.vlr.gg/player/71202", teams: "fatlip (Indonesia): Rojali" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "GEKKOU ESPORTS", role: "Main", player: "Secret Meow", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Gjs", role: "Main", player: "kelvin", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Gjs", role: "Main", player: "edward", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/24256", teams: "Edward (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Gjs", role: "Main", player: "radit", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Gjs", role: "Main", player: "hakim", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Gjs", role: "Main", player: "aan", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Gjs", role: "Substitute", player: "tiyo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "GLE FURY", role: "Main", player: "Xycrone", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/49272", teams: "ABYSSAL FIREFLY / KROMATIC SHIRE / JINXPRO" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "GLE FURY", role: "Main", player: "Lumiere", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/14295", teams: "lumiere (International): no teams" }, { url: "https://www.vlr.gg/player/59537", teams: "lumiere (Indonesia): .Orbit" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "GLE FURY", role: "Main", player: "Massss", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/61647", teams: "ABYSSAL FIREFLY / KROMATIC SHIRE" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "GLE FURY", role: "Main", player: "Tibo", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/49270", teams: "ABYSSAL FIREFLY / KROMATIC SHIRE / JINXPRO" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster; 1 same-name profile(s) from other countries ignored" },
  { team: "GLE FURY", role: "Main", player: "Jake", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/56104", teams: "Exogen / ex EAID" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team; 4 same-name profile(s) from other countries ignored" },
  { team: "GLE FURY", role: "Substitute", player: "Ryukka", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/64150", teams: "ETX Noblesse" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "KEEP ENJOYS", role: "Main", player: "dbEXE", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KEEP ENJOYS", role: "Main", player: "Coco", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/43490", teams: "coco (Indonesia): Hepi Papi / Brawijaya Esports / Gegelato UB" }, { url: "https://www.vlr.gg/player/17549", teams: "coco (International): Equinox Angeli" }, { url: "https://www.vlr.gg/player/18227", teams: "coco (International): no teams" }, { url: "https://www.vlr.gg/player/27902", teams: "Coco (International): no teams" }, { url: "https://www.vlr.gg/player/64754", teams: "coco (International): FOREVER" }], notes: "5 same-name candidate(s) (Indonesia/International), can't tell which; 9 same-name profile(s) from other countries ignored" },
  { team: "KEEP ENJOYS", role: "Main", player: "GnarLy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KEEP ENJOYS", role: "Main", player: "Aer67", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KEEP ENJOYS", role: "Main", player: "Chico", status: "Not found", notes: "Only same-name players from other countries (2)" },
  { team: "KEEP ENJOYS", role: "Substitute", player: "Issey", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/62700", teams: "issey (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "KEEP ENJOYS", role: "Substitute", player: "4Key", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KROMATIC SHIRE", role: "Main", player: "LIMBO", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61653", teams: "KROMATIC SHIRE / KROMATIC PHORCYS / KROMATIC DONKEY" }], notes: "vlr.gg already lists them under this team" },
  { team: "KROMATIC SHIRE", role: "Main", player: "AXYO", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KROMATIC SHIRE", role: "Main", player: "PALD", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KROMATIC SHIRE", role: "Main", player: "R3ADER", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/63976", teams: "KROMATIC SHIRE / BARA API PRIME" }], notes: "vlr.gg already lists them under this team" },
  { team: "KROMATIC SHIRE", role: "Main", player: "SHOSANNA", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "KROMATIC SHIRE", role: "Substitute", player: "MRVL", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/34078", teams: "Nomads / MPRUYYY / Rudi Family" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "LANGIT BAJA", role: "Main", player: "firen#git", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "LANGIT BAJA", role: "Main", player: "Dyzin#Eujin", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "LANGIT BAJA", role: "Main", player: "Liery#911", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/54735", teams: "JINXPRO NOURA" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "LANGIT BAJA", role: "Main", player: "arytas#ming", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "LANGIT BAJA", role: "Main", player: "itoldyouthings#ongeh", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "LANGIT BAJA", role: "Substitute", player: "Kookie#rachl", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/63174", teams: "kookie (International): 7VEN" }, { url: "https://www.vlr.gg/player/55554", teams: "Kookie (International): Proximity" }, { url: "https://www.vlr.gg/player/48912", teams: "Kookie (International): Balkan Tuah" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 2 same-name profile(s) from other countries ignored" },
  { team: "M&M", role: "Main", player: "katarinabluu #VIT", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "M&M", role: "Main", player: "Madelyn #1010", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/9290", teams: "Revenant XSpark / Team Nemesis / Velocity Gaming" }], liquipedia: "https://liquipedia.net/valorant/Madelyn", notes: "Has a Liquipedia page; 1 same-name profile(s) from other countries ignored" },
  { team: "M&M", role: "Main", player: "HZ k1ngkappa愛 #tofuu", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/10749" }], liquipedia: "https://liquipedia.net/valorant/K1ngkappa", notes: "Has a Liquipedia page; vlr.gg ID taken from Liquipedia" },
  { team: "M&M", role: "Main", player: "AEKN val #1004", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/64313", teams: "Val (International): no teams" }, { url: "https://www.vlr.gg/player/66590", teams: "Val (International): no teams" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "M&M", role: "Main", player: "HZ artaa #igii", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/13119", teams: "Hertz Esport / La Familia / MPRUYYY" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "MALAIKAT PENEMBAK", role: "Main", player: "Bywuuu", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/59538", teams: "ETX Noblesse" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "MALAIKAT PENEMBAK", role: "Main", player: "ByLonaa", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/51813", teams: "ETX Noblesse" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "MALAIKAT PENEMBAK", role: "Main", player: "dicxie", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/51810", teams: "ETX Noblesse" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "MALAIKAT PENEMBAK", role: "Main", player: "nerv1sh", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "MALAIKAT PENEMBAK", role: "Main", player: "eyepatch眼帯", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "MALAIKAT PENEMBAK", role: "Substitute", player: "Hushy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "MALAIKAT PENEMBAK", role: "Substitute", player: "mean it", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Main", player: "tristitia#depre", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Main", player: "7S meongsupreme#miaw", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Main", player: "Bob#santo", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/10858", teams: "Bob (Indonesia): BIBD / Team Phenix / Roisseur" }, { url: "https://www.vlr.gg/player/16829", teams: "Bob (Indonesia): Brawijaya Esports / Orion Genesis eSports / Thieves of Hours" }, { url: "https://www.vlr.gg/player/12369", teams: "Bob (International): Limitless" }, { url: "https://www.vlr.gg/player/23606", teams: "Bob (Indonesia): GOB Incloud" }, { url: "https://www.vlr.gg/player/41321", teams: "Bob (International): Team Kenya" }, { url: "https://www.vlr.gg/player/7854", teams: "Bob (International): LT" }], notes: "6 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "masquerade", role: "Main", player: "Devolzre#6996", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Main", player: "Bigboyblack#ongeh", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Substitute", player: "altic#rawr", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "masquerade", role: "Substitute", player: "22tRickz#FML", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/23628", teams: "Masquerade" }], notes: "vlr.gg already lists them under this team" },
  { team: "MRDP Gamers Gear", role: "Main", player: "Nave#MRDP", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/42069", teams: "nave (International): no teams" }, { url: "https://www.vlr.gg/player/8868", teams: "Nave (International): Face Off / Hyperspace Dark" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "MRDP Gamers Gear", role: "Main", player: "XANTARE11#right", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "MRDP Gamers Gear", role: "Main", player: "nyxx#ghixx", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/46274", teams: "Nyxx (International): BHOP Esports" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "MRDP Gamers Gear", role: "Main", player: "Buba#BUM", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "MRDP Gamers Gear", role: "Main", player: "Kirei#sia", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "NEVERLAND713", role: "Main", player: "capeesha", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/34104", teams: "NEVERLAND713 / ANTASENA / Team Nemesis" }], liquipedia: "https://liquipedia.net/valorant/Capeesha", notes: "Has a Liquipedia page" },
  { team: "NEVERLAND713", role: "Main", player: "Lee", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/37067", teams: "ANTASENA / Rudi Family / NEED ORG" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster; 1 same-name profile(s) from other countries ignored" },
  { team: "NEVERLAND713", role: "Main", player: "fausTao", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/34096", teams: "NEVERLAND713 / Team Nemesis / The God Medusa" }], liquipedia: "https://liquipedia.net/valorant/FausTao", notes: "Has a Liquipedia page" },
  { team: "NEVERLAND713", role: "Main", player: "HZBY", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/59559", teams: "Surprise / NEVERLAND713 / ANTASENA" }], notes: "vlr.gg already lists them under this team" },
  { team: "NEVERLAND713", role: "Main", player: "Magician", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/43443", teams: "NEVERLAND713 / Bandung SUPERTEAM / Team SES" }], notes: "vlr.gg already lists them under this team; 1 same-name profile(s) from other countries ignored" },
  { team: "NEVERLAND713", role: "Substitute", player: "ahongboy", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/48772", teams: "NEVERLAND713 / Bandung SUPERTEAM / Team SES" }], notes: "vlr.gg already lists them under this team" },
  { team: "newgen", role: "Main", player: "Chrollo #fafa", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/43501", teams: "Kertanegara Esports / EVOS ARF / ARF TEAM" }], liquipedia: "https://liquipedia.net/valorant/Chrollo_(Indonesian_player)", notes: "Has a Liquipedia page; 1 same-name profile(s) from other countries ignored" },
  { team: "newgen", role: "Main", player: "Julien Loki#hyoon", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "newgen", role: "Main", player: "hixer#kity", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/37068", teams: "NEVERLAND713 / Bandung SUPERTEAM / THE OVERDOGS" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "newgen", role: "Main", player: "Rune #Evee", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "newgen", role: "Main", player: "Hitman#LFT", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/43503", teams: "Hitman (Indonesia): Nomads / Devilz GG" }, { url: "https://www.vlr.gg/player/20006", teams: "HITMAN (International): Team ECO Dark Alliance" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "NINJAGOD", role: "Main", player: "Adebroodinz", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/63985", teams: "Excellent Team" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "NINJAGOD", role: "Main", player: "Lui", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NINJAGOD", role: "Main", player: "Sekki", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/44984", teams: "Sekki (International): HELIOS" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "NINJAGOD", role: "Main", player: "iceu", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NINJAGOD", role: "Main", player: "は自分自身を愛している", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NOT", role: "Main", player: "Ngab Ojan", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NOT", role: "Main", player: "KnZinn", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NOT", role: "Main", player: "Shynee", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NOT", role: "Main", player: "Chamber", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/64243", teams: "Chamber (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "NOT", role: "Main", player: "AzZzy", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/61499", teams: "bONF1RE" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "NOT", role: "Substitute", player: "bian#shan", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "NOT", role: "Substitute", player: "Casper", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Nova Flamma", role: "Main", player: "Sentry", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Nova Flamma", role: "Main", player: "virtuoso", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/11078", teams: "Virtuoso (International): no teams" }, { url: "https://www.vlr.gg/player/16815", teams: "Virtuoso (Indonesia): Nongkrong Kilat" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "Nova Flamma", role: "Main", player: "akira", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/54618", teams: "Akira (International): Elevate" }, { url: "https://www.vlr.gg/player/50947", teams: "akira (International): no teams" }, { url: "https://www.vlr.gg/player/59544", teams: "akira (Indonesia): ETX Noblesse" }, { url: "https://www.vlr.gg/player/65394", teams: "Akira (International): no teams" }, { url: "https://www.vlr.gg/player/26931", teams: "Akira (International): no teams" }], notes: "5 same-name candidate(s) (Indonesia/International), can't tell which; 5 same-name profile(s) from other countries ignored" },
  { team: "Nova Flamma", role: "Main", player: "SeanZ", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Nova Flamma", role: "Main", player: "Tusk", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Nova Flamma", role: "Substitute", player: "Fepee", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/63989", teams: "Excellent Team" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "OMBAK TEAM", role: "Main", player: "TUPAI", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/34082", teams: "NINJA TEAM / EVOS ARF / Team Poupi" }], liquipedia: "https://liquipedia.net/valorant/Tupai", notes: "Has a Liquipedia page" },
  { team: "OMBAK TEAM", role: "Main", player: "NAROKS", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/59514", teams: "NINJA TEAM / Team Poupi / V RAPTOR" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "OMBAK TEAM", role: "Main", player: "SLUSHY", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "OMBAK TEAM", role: "Main", player: "Dekun", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/56120", teams: "Hive / TR ESPORT / Tel-U X Ohana Excelsio" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "OMBAK TEAM", role: "Main", player: "bayon", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/24706", teams: "bayon (International): ReigN" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Peace of mind", role: "Main", player: "Nthz", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/43453", teams: "Nthz (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Peace of mind", role: "Main", player: "Van", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/45279", teams: "Van (International): no teams" }, { url: "https://www.vlr.gg/player/50638", teams: "VaN (International): 2AM Esports" }, { url: "https://www.vlr.gg/player/49408", teams: "Van (Indonesia): Untarian Nerds" }, { url: "https://www.vlr.gg/player/41531", teams: "van (Indonesia): BCT Esport" }], notes: "4 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Peace of mind", role: "Main", player: "CIBI", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/39404", teams: "cibi (International): SOL Mayari / Crimson Valkyrie / One Hit Delete" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Peace of mind", role: "Main", player: "Be something", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Peace of mind", role: "Main", player: "Eivluw", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Peace of mind", role: "Substitute", player: "Qruz", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/61515", teams: "EDAN" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "Peace of mind", role: "Substitute", player: "peaceofmind安心#Jiw", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Penjinak BoM!", role: "Main", player: "Hann#Lynn", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/49411", teams: "Untarian Nerds" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster; 1 same-name profile(s) from other countries ignored" },
  { team: "Penjinak BoM!", role: "Main", player: "eoJ#0121", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Penjinak BoM!", role: "Main", player: "Yue#Decay", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/60661", teams: "yue (International): no teams" }, { url: "https://www.vlr.gg/player/35110", teams: "yue (International): no teams" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "Penjinak BoM!", role: "Main", player: "LiaM#daph", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/49410", teams: "FINIX VELOCITY / Untarian Nerds" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster; 3 same-name profile(s) from other countries ignored" },
  { team: "Penjinak BoM!", role: "Main", player: "Cyno#20041", status: "Likely", vlr: [{ url: "https://www.vlr.gg/player/49409", teams: "FINIX VELOCITY / Untarian Nerds" }], notes: "Indonesian profile; shares a past team with teammate(s) on this roster" },
  { team: "Preman Pensiun", role: "Main", player: "Voivode#505", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Preman Pensiun", role: "Main", player: "mike wazowski #bella", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Preman Pensiun", role: "Main", player: "Fabio Quartararo#TARO", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Preman Pensiun", role: "Main", player: "moramora#yaya", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Preman Pensiun", role: "Main", player: "Miyu#yello", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/37056", teams: "Miyu (Indonesia): hogriderfc / Team Nemesis / Ora Geter Lur" }, { url: "https://www.vlr.gg/player/10837", teams: "Miyu (Indonesia): MOC Team" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 2 same-name profile(s) from other countries ignored" },
  { team: "Preman Pensiun", role: "Substitute", player: "TS DaveVash#DDDD", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Preman Pensiun", role: "Substitute", player: "esminion#mike", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Regicida", role: "Main", player: "RGC Crucible", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Regicida", role: "Main", player: "RGC fallen", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/50656", teams: "FalleN (International): Farmakas" }, { url: "https://www.vlr.gg/player/53544", teams: "FalleN (International): ShogunGG" }, { url: "https://www.vlr.gg/player/57110", teams: "Fallen (Indonesia): UNDIP DEC" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "Regicida", role: "Main", player: "RGC DreamSet", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/57064", teams: "ANIKOM Pembasmi Klitih" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "Regicida", role: "Main", player: "RGC Ikuyo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Regicida", role: "Main", player: "RGC L4tios", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Regicida", role: "Substitute", player: "RGC vaxiiz", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "RILEKBRE", role: "Main", player: "fr1md", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "RILEKBRE", role: "Main", player: "STRATO", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "RILEKBRE", role: "Main", player: "ubinbengkel", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "RILEKBRE", role: "Main", player: "takara", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "RILEKBRE", role: "Main", player: "PutzGrav", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/11798", teams: "GOB E-SPORTS" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "SENTINEL DOGS", role: "Main", player: "W3LL", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SENTINEL DOGS", role: "Main", player: "akong", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SENTINEL DOGS", role: "Main", player: "kruM", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/43526", teams: "Be Good / West Aspect / Binus x Widyatama" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "SENTINEL DOGS", role: "Main", player: "fOREM", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SENTINEL DOGS", role: "Main", player: "vorrxth", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SENTINEL DOGS", role: "Substitute", player: "Alrszx", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Seventh Letter Gaming", role: "Main", player: "netlov", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/56098", teams: "Seventh Letter Gaming / Kertanegara Esports" }], notes: "vlr.gg already lists them under this team" },
  { team: "Seventh Letter Gaming", role: "Main", player: "Scar", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/34100", teams: "Seventh Letter Gaming / Alter Ego / Vyres Esports" }], liquipedia: "https://liquipedia.net/valorant/SCar", notes: "Has a Liquipedia page; 3 same-name profile(s) from other countries ignored" },
  { team: "Seventh Letter Gaming", role: "Main", player: "JayH", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "Seventh Letter Gaming", role: "Main", player: "Amernone", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/27645", teams: "Seventh Letter Gaming / Kertanegara Esports / EVOS ARF" }], liquipedia: "https://liquipedia.net/valorant/AmerNone", notes: "Has a Liquipedia page" },
  { team: "Seventh Letter Gaming", role: "Main", player: "Jefz", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/23709", teams: "Seventh Letter Gaming / Kertanegara Esports / Cynical" }], liquipedia: "https://liquipedia.net/valorant/BEASTJefz", notes: "Has a Liquipedia page" },
  { team: "Squad Tenaga", role: "Main", player: "bjorr boom boom#chp30", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Squad Tenaga", role: "Main", player: "Azunya#JMK48", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61537", teams: "Squad Tenaga" }], notes: "vlr.gg already lists them under this team" },
  { team: "Squad Tenaga", role: "Main", player: "DimplesZs#shi", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61659", teams: "Squad Tenaga" }], notes: "vlr.gg already lists them under this team" },
  { team: "Squad Tenaga", role: "Main", player: "JeZterrr#01058", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61533", teams: "Squad Tenaga" }], notes: "vlr.gg already lists them under this team" },
  { team: "Squad Tenaga", role: "Main", player: "VryNex#0000", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61806", teams: "Squad Tenaga" }], notes: "vlr.gg already lists them under this team" },
  { team: "Squad Tenaga", role: "Substitute", player: "HyemdaN#iroha", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Squad Tenaga", role: "Substitute", player: "Akaza#OP81", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/64936", teams: "akaza (International): New Vision" }, { url: "https://www.vlr.gg/player/73518", teams: "akaza (International): no teams" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "SS x ITShop", role: "Main", player: "CURRENT", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/57020", teams: "XGATE Eternal" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "SS x ITShop", role: "Main", player: "COLD", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/11452", teams: "Cold (Indonesia): BIBD / Ongeh / Lucia Synex" }, { url: "https://www.vlr.gg/player/50552", teams: "Cold (International): Atlantis Esports" }, { url: "https://www.vlr.gg/player/15816", teams: "Cold (International): Gangsheet" }, { url: "https://www.vlr.gg/player/65424", teams: "cold (International): no teams" }], notes: "4 same-name candidate(s) (Indonesia/International), can't tell which; 3 same-name profile(s) from other countries ignored" },
  { team: "SS x ITShop", role: "Main", player: "MONTECARLO", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/52096", teams: "Ayam" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "SS x ITShop", role: "Main", player: "STINGRAY", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/56961", teams: "XGATE FAITH" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "SS x ITShop", role: "Main", player: "SHIBUB", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SS x ITShop", role: "Substitute", player: "benerjuga", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SSV", role: "Main", player: "AghXo#eyyen", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SSV", role: "Main", player: "Mbull#akhhh", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SSV", role: "Main", player: "Mira Yoo#Nto", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "SSV", role: "Main", player: "XyRo#wkwk", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/57071", teams: "SSV / UMM SSV" }], notes: "vlr.gg already lists them under this team; 1 same-name profile(s) from other countries ignored" },
  { team: "SSV", role: "Main", player: "Berliano#4201", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/57069", teams: "SSV / UMM SSV" }], notes: "vlr.gg already lists them under this team" },
  { team: "SSV", role: "Substitute", player: "Jaeyyy#lalaw", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "STYX", role: "Main", player: "Doom", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/59829", teams: "Doom (International): no teams" }, { url: "https://www.vlr.gg/player/56117", teams: "DooM (Indonesia): TR ESPORT / UCE REVENANT / NENEK GIMANG" }, { url: "https://www.vlr.gg/player/21525", teams: "Doom (International): no teams" }, { url: "https://www.vlr.gg/player/60501", teams: "doom (International): Team DENIGHT" }, { url: "https://www.vlr.gg/player/53756", teams: "DOOM (International): no teams" }, { url: "https://www.vlr.gg/player/71095", teams: "Doom (International): no teams" }, { url: "https://www.vlr.gg/player/65295", teams: "doom (International): SILENCE / NOT winning" }], notes: "7 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "STYX", role: "Main", player: "carmine", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/34149", teams: "Svvagy FC / Rizz Academy" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team; 1 same-name profile(s) from other countries ignored" },
  { team: "STYX", role: "Main", player: "borsecond", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "STYX", role: "Main", player: "tripp1n", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "STYX", role: "Main", player: "dayong", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "STYX", role: "Substitute", player: "QwerticZ", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "STYX", role: "Substitute", player: "Papskieee", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Team SC", role: "Main", player: "SC FoursevenZ", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/67530", teams: "FoursevenZ (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Team SC", role: "Main", player: "megumen", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/67528", teams: "MegumeN (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Team SC", role: "Main", player: "Andar", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Team SC", role: "Main", player: "Fleuryy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Team SC", role: "Main", player: "pingu", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/40163", teams: "Pingu (International): no teams" }, { url: "https://www.vlr.gg/player/43177", teams: "pingu (International): Swingers" }, { url: "https://www.vlr.gg/player/13143", teams: "Pingu (Indonesia): CUEK" }, { url: "https://www.vlr.gg/player/67836", teams: "Pingu (International): no teams" }], notes: "4 same-name candidate(s) (Indonesia/International), can't tell which; 2 same-name profile(s) from other countries ignored" },
  { team: "Team SC", role: "Substitute", player: "Anandaa", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Team SC", role: "Substitute", player: "Rogue", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/10305", teams: "Rogue (International): lancaster bombers" }, { url: "https://www.vlr.gg/player/46738", teams: "Rogue (International): no teams" }, { url: "https://www.vlr.gg/player/45345", teams: "Rogue (International): no teams" }, { url: "https://www.vlr.gg/player/21175", teams: "rOGUE (International): The Panic Team" }], notes: "4 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "Thanatos", role: "Main", player: "mEugeo#Riena", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thanatos", role: "Main", player: "ZIDNUT#6969", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thanatos", role: "Main", player: "FTH pisashii#HAEWN", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thanatos", role: "Main", player: "Evergarden#andy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thanatos", role: "Main", player: "beelzebob#9000", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thrower", role: "Main", player: "Kaee", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/37329" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "Thrower", role: "Main", player: "Shiki", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/63080", teams: "Shiki (International): Project Swede" }, { url: "https://www.vlr.gg/player/50043", teams: "Shiki (Indonesia): Team Jeicchu" }, { url: "https://www.vlr.gg/player/66362", teams: "shiki (International): Harrickisboosted" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "Thrower", role: "Main", player: "pinkypangs", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thrower", role: "Main", player: "Kaijer", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thrower", role: "Main", player: "Cherished", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thrower", role: "Substitute", player: "tavi", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Thrower", role: "Substitute", player: "JusTeen", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/37331", teams: "JusTeen (International): no teams" }], notes: "1 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "Trapstar", role: "Main", player: "zyoo#gtgg", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Main", player: "Kuzzty#4646", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Main", player: "p3RFECT#zin", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Main", player: "Skkie#2005", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Main", player: "Sapi#2107", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Substitute", player: "Lelo#0706", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Trapstar", role: "Substitute", player: "Rielll#8888", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "UG Noctivision", role: "Main", player: "Exxos", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/57058", teams: "UG Noctivision" }], notes: "vlr.gg already lists them under this team" },
  { team: "UG Noctivision", role: "Main", player: "KeY", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/57056", teams: "GE Noctivision / UG Noctivision" }], notes: "vlr.gg already lists them under this team; 3 same-name profile(s) from other countries ignored" },
  { team: "UG Noctivision", role: "Main", player: "DeV", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/42070", teams: "Dev (International): no teams" }, { url: "https://www.vlr.gg/player/41824", teams: "dev (International): OC Esports" }, { url: "https://www.vlr.gg/player/53768", teams: "dev (International): DePaul Blue Demons / DPU" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 4 same-name profile(s) from other countries ignored" },
  { team: "UG Noctivision", role: "Main", player: "Friga", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "UG Noctivision", role: "Main", player: "Swhite", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "UI HAKUJI", role: "Main", player: "asthazera#1607", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "UI HAKUJI", role: "Main", player: "k1rbyy#alien", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/57107", teams: "UI Hakuji / UI ESC" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI HAKUJI", role: "Main", player: "Frag1le#HOLO", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/66359", teams: "UI Hakuji" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI HAKUJI", role: "Main", player: "Kyle#cher", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/66358", teams: "UI Hakuji" }], notes: "vlr.gg already lists them under this team; 4 same-name profile(s) from other countries ignored" },
  { team: "UI HAKUJI", role: "Main", player: "DSR#1107", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61538", teams: "UI Hakuji / PAPUY" }], notes: "vlr.gg already lists them under this team; 1 same-name profile(s) from other countries ignored" },
  { team: "UI HAKUJI", role: "Substitute", player: "FAYKOSKELLY#AWE", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61525", teams: "UI Hakuji / UI Kuro" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI KURO", role: "Main", player: "4effect", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61523", teams: "UI Kuro" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI KURO", role: "Main", player: "digidaw", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61518", teams: "UI Kuro" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI KURO", role: "Main", player: "reminiscence", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/63995", teams: "UI Kuro" }], notes: "vlr.gg already lists them under this team" },
  { team: "UI KURO", role: "Main", player: "yamไก", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "UI KURO", role: "Main", player: "CR Meiy", status: "Not found", notes: "Only same-name players from other countries (1)" },
  { team: "UI KURO", role: "Substitute", player: "Seven Stars", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VALO 5 WAKTU", role: "Main", player: "Mattvictus", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VALO 5 WAKTU", role: "Main", player: "w1sh", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/48729", teams: "NINJA TEAM / Team Poupi / La Familia" }], liquipedia: "https://liquipedia.net/valorant/W1sh", notes: "Has a Liquipedia page; 1 same-name profile(s) from other countries ignored" },
  { team: "VALO 5 WAKTU", role: "Main", player: "Sieghart", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VALO 5 WAKTU", role: "Main", player: "fay", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/48721", teams: "fay (Indonesia): Rojali / cimall / DRK esport" }, { url: "https://www.vlr.gg/player/43923", teams: "Fay (International): no teams" }, { url: "https://www.vlr.gg/player/41650", teams: "fay (International): Castle Black Esports" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 2 same-name profile(s) from other countries ignored" },
  { team: "VALO 5 WAKTU", role: "Main", player: "peterpan", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/66352", teams: "UI Kuda Putih" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team; 2 same-name profile(s) from other countries ignored" },
  { team: "Valorant Berkah", role: "Main", player: "mandalaJr", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/13121", teams: "Valorant Berkah / Punten Jagoan / Nongkrong Kilat" }], notes: "vlr.gg already lists them under this team" },
  { team: "Valorant Berkah", role: "Main", player: "doRie", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Valorant Berkah", role: "Main", player: "Gelz", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61654", teams: "Valorant Berkah" }], notes: "vlr.gg already lists them under this team" },
  { team: "Valorant Berkah", role: "Main", player: "langzin", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/61656", teams: "Valorant Berkah" }], notes: "vlr.gg already lists them under this team" },
  { team: "Valorant Berkah", role: "Main", player: "YOOBABY", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Valorant Berkah", role: "Substitute", player: "a p i k", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Valorant Berkah", role: "Substitute", player: "oreopiie", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Vanguard Ego", role: "Main", player: "DarkOreo", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Vanguard Ego", role: "Main", player: "ALEXSANDER", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/56290", teams: "UMB NOVA" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "Vanguard Ego", role: "Main", player: "Somewhere", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "Vanguard Ego", role: "Main", player: "Shiki", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/63080", teams: "Shiki (International): Project Swede" }, { url: "https://www.vlr.gg/player/50043", teams: "Shiki (Indonesia): Team Jeicchu" }, { url: "https://www.vlr.gg/player/66362", teams: "shiki (International): Harrickisboosted" }], notes: "3 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "Vanguard Ego", role: "Main", player: "ephemeral", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VIRELLIUM", role: "Main", player: "Berzyy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VIRELLIUM", role: "Main", player: "g0ldenboy", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/63977", teams: "Amity Voyage" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "VIRELLIUM", role: "Main", player: "Nezhaa", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VIRELLIUM", role: "Main", player: "Dapskut", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VIRELLIUM", role: "Main", player: "Van", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/45279", teams: "Van (International): no teams" }, { url: "https://www.vlr.gg/player/50638", teams: "VaN (International): 2AM Esports" }, { url: "https://www.vlr.gg/player/49408", teams: "Van (Indonesia): Untarian Nerds" }, { url: "https://www.vlr.gg/player/41531", teams: "van (Indonesia): BCT Esport" }], notes: "4 same-name candidate(s) (Indonesia/International), can't tell which" },
  { team: "VIRELLIUM", role: "Substitute", player: "July", status: "Not found", notes: "Only same-name players from other countries (2)" },
  { team: "VOYAGE", role: "Main", player: "lyra#ivy", status: "Unclear", vlr: [{ url: "https://www.vlr.gg/player/53051", teams: "lyra (International): Celestial Stars / XinreN Sirens" }, { url: "https://www.vlr.gg/player/67418", teams: "lyra (International): Exsouls Violet" }], notes: "2 same-name candidate(s) (Indonesia/International), can't tell which; 1 same-name profile(s) from other countries ignored" },
  { team: "VOYAGE", role: "Main", player: "D3ezy#1204", status: "Possible", vlr: [{ url: "https://www.vlr.gg/player/51957", teams: "NUTSN / Leones Suyud" }], notes: "Only one same-name profile on vlr.gg (Indonesian), but nothing ties it to this team" },
  { team: "VOYAGE", role: "Main", player: "tavorynz#ved", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VOYAGE", role: "Main", player: "BabySoda#stzzy", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "VOYAGE", role: "Main", player: "V4nity#2708", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "WASHED", role: "Main", player: "PT KARYA MANDIRI#16888", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "WASHED", role: "Main", player: "Wys#piyii", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/56114", teams: "Washed" }], notes: "vlr.gg already lists them under this team" },
  { team: "WASHED", role: "Main", player: "Hes#BBH", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/23642", teams: "Washed / Pejuang / Roisseur" }], notes: "vlr.gg already lists them under this team" },
  { team: "WASHED", role: "Main", player: "mingmong#xmm", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "WASHED", role: "Main", player: "4Mnt#BULLS", status: "Confirmed", vlr: [{ url: "https://www.vlr.gg/player/56115", teams: "Washed" }], notes: "vlr.gg already lists them under this team" },
  { team: "WASHED", role: "Substitute", player: "Pokedex#dex", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
  { team: "WASHED", role: "Substitute", player: "s4ntafe bahaya#haha", status: "Not found", notes: "No vlr.gg or Liquipedia profile with this name" },
]

const TEAMS = [...new Set(players.map((p) => p.team))].sort((a, b) => a.localeCompare(b))

const STATUS_COUNTS = STATUSES.reduce(
  (acc, s) => ({ ...acc, [s]: players.filter((p) => p.status === s).length }),
  {} as Record<Status, number>,
)

const STATUS_CLASS: Record<Status, string> = {
  Confirmed: styles.confirmed,
  Likely: styles.likely,
  Possible: styles.possible,
  Unclear: styles.unclear,
  'Not found': styles.notFound,
}

const byStatus: SortingFn<Player> = (a, b) =>
  STATUSES.indexOf(a.original.status) - STATUSES.indexOf(b.original.status)

const inList: FilterFn<Player> = (row, columnId, value: string[]) =>
  value.length === 0 || value.includes(row.getValue<string>(columnId))

const searchText: FilterFn<Player> = (row, _columnId, value: string) => {
  const q = value.trim().toLowerCase()
  if (!q) return true
  const p = row.original
  return [p.player, p.team, p.notes, ...(p.vlr?.map((c) => c.teams ?? '') ?? [])]
    .join(' ')
    .toLowerCase()
    .includes(q)
}

const col = createColumnHelper<Player>()

const columns = [
  col.accessor('team', { header: 'Team', filterFn: 'equalsString' }),
  col.accessor('player', { header: 'Player (Riot ID)' }),
  col.accessor('role', { header: 'Role', filterFn: 'equalsString' }),
  col.accessor('status', {
    header: 'Status',
    sortingFn: byStatus,
    filterFn: inList,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  col.display({
    id: 'profiles',
    header: 'Profiles',
    cell: (info) => <Profiles player={info.row.original} />,
  }),
  col.accessor('notes', { header: 'Notes', enableSorting: false }),
]

function vlrLabel(url: string) {
  const id = url.match(/player\/(\d+)/)?.[1]
  return id ? `vlr.gg #${id}` : 'vlr.gg'
}

function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLASS[status]}`} title={STATUS_HINT[status]}>
      {status}
    </span>
  )
}

function Profiles({ player }: { player: Player }) {
  if (!player.vlr && !player.liquipedia) return <span className={styles.muted}>—</span>
  return (
    <ul className={styles.profiles}>
      {player.vlr?.map((c) => (
        <li key={c.url}>
          <a href={c.url} target="_blank" rel="noreferrer">
            {vlrLabel(c.url)}
          </a>
          {c.teams && <span className={styles.teams}>{c.teams}</span>}
        </li>
      ))}
      {player.liquipedia && (
        <li>
          <a href={player.liquipedia} target="_blank" rel="noreferrer">
            Liquipedia
          </a>
        </li>
      )}
    </ul>
  )
}

const MOBILE_QUERY = '(max-width: 720px)'

function subscribeMobile(onChange: () => void) {
  const mq = window.matchMedia(MOBILE_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, () => window.matchMedia(MOBILE_QUERY).matches)
}

function SeaKickoffRosters() {
  // TanStack Table returns a mutable table instance that the React Compiler can't
  // memoize safely (sort/filter clicks would show stale rows), so opt this component out.
  'use no memo'
  const isMobile = useIsMobile()
  const [search, setSearch] = useState('')
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  // eslint-disable-next-line react-hooks/incompatible-library -- opted out of memoization above
  const table = useReactTable({
    data: players,
    columns,
    state: { sorting, columnFilters, globalFilter: search },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setSearch,
    globalFilterFn: searchText,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const statusCol = table.getColumn('status')!
  const teamCol = table.getColumn('team')!
  const roleCol = table.getColumn('role')!
  const selectedStatuses = (statusCol.getFilterValue() as Status[] | undefined) ?? []
  const rows = table.getRowModel().rows
  const filtered = search !== '' || columnFilters.length > 0

  const toggleStatus = (s: Status) => {
    const next = selectedStatuses.includes(s)
      ? selectedStatuses.filter((x) => x !== s)
      : [...selectedStatuses, s]
    statusCol.setFilterValue(next.length ? next : undefined)
  }

  const reset = () => {
    setSearch('')
    setColumnFilters([])
    setSorting([])
  }

  return (
    <main className={styles.page}>
      <div className={styles.back}>
        <Link to="/">← Back</Link>
      </div>

      <header className={styles.header}>
        <p className={styles.label}>Valorant · SEA Kickoff · Indonesia</p>
        <h1 className={styles.title}>Roster Cross-check</h1>
        <p className={styles.subtitle}>
          {players.length} registered Riot IDs across {TEAMS.length} teams, matched against vlr.gg
          and Liquipedia.
        </p>
      </header>

      <section className={styles.controls} aria-label="Filters">
        <input
          type="search"
          className={styles.search}
          placeholder="Search player, team, notes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search"
        />

        <div
          className={styles.chips}
          role="group"
          aria-label="Match status"
          data-active={selectedStatuses.length > 0 || undefined}
        >
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              className={`${styles.chip} ${STATUS_CLASS[s]}`}
              aria-pressed={selectedStatuses.includes(s)}
              title={STATUS_HINT[s]}
              onClick={() => toggleStatus(s)}
            >
              {s} <span className={styles.count}>{STATUS_COUNTS[s]}</span>
            </button>
          ))}
        </div>

        <div className={styles.selects}>
          <select
            value={(teamCol.getFilterValue() as string | undefined) ?? ''}
            onChange={(e) => teamCol.setFilterValue(e.target.value || undefined)}
            aria-label="Team"
          >
            <option value="">All teams</option>
            {TEAMS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={(roleCol.getFilterValue() as string | undefined) ?? ''}
            onChange={(e) => roleCol.setFilterValue(e.target.value || undefined)}
            aria-label="Role"
          >
            <option value="">Main + Substitute</option>
            <option value="Main">Main only</option>
            <option value="Substitute">Substitute only</option>
          </select>
          {isMobile && (
            <select
              value={sorting[0] ? `${sorting[0].id}:${sorting[0].desc ? 'desc' : 'asc'}` : ''}
              onChange={(e) => {
                const [id, dir] = e.target.value.split(':')
                setSorting(id ? [{ id, desc: dir === 'desc' }] : [])
              }}
              aria-label="Sort by"
            >
              <option value="">Sort: team order</option>
              <option value="status:asc">Sort: best match first</option>
              <option value="status:desc">Sort: weakest match first</option>
              <option value="player:asc">Sort: player A–Z</option>
            </select>
          )}
        </div>

        <p className={styles.summary} aria-live="polite">
          Showing {rows.length} of {players.length}
          {filtered && (
            <button type="button" className={styles.reset} onClick={reset}>
              Clear filters
            </button>
          )}
        </p>
      </section>

      {rows.length === 0 ? (
        <p className={styles.empty}>No players match these filters.</p>
      ) : isMobile ? (
        <ul className={styles.cards}>
          {rows.map((row) => {
            const p = row.original
            return (
              <li key={row.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.player}>{p.player}</span>
                  <StatusBadge status={p.status} />
                </div>
                <div className={styles.cardMeta}>
                  {p.team} · {p.role}
                </div>
                {(p.vlr || p.liquipedia) && <Profiles player={p} />}
                <p className={styles.notes}>{p.notes}</p>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => {
                    const sorted = h.column.getIsSorted()
                    return (
                      <th
                        key={h.id}
                        aria-sort={
                          sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                        }
                      >
                        {h.column.getCanSort() ? (
                          <button
                            type="button"
                            className={styles.sortBtn}
                            onClick={h.column.getToggleSortingHandler()}
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            <span className={styles.sortIcon} aria-hidden>
                              {sorted === 'asc' ? '▲' : sorted === 'desc' ? '▼' : '↕'}
                            </span>
                          </button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={styles[`col_${cell.column.id}`]}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default SeaKickoffRosters
