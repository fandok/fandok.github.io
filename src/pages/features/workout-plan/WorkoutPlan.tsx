import { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./WorkoutPlan.module.css"

type Scenario = "keep" | "cancel"

const GYM_SCENARIOS: Record<Scenario, { label: string; icon: string; color: string; bg: string; desc: string }> = {
  keep: {
    label: "Keep Gym",
    icon: "🏋️",
    color: "#1a5f85",
    bg: "#dbeeff",
    desc: "Gym available throughout. Best for knee protection & rainy nights."
  },
  cancel: {
    label: "Cancel Gym",
    icon: "🏃",
    color: "#1e6b2b",
    bg: "#d4f5d4",
    desc: "Outdoor + bodyweight only. Still achievable — need more discipline on strength days."
  }
}

type DayActivity = { type: string; detail: string }
type Day = { label: string; timing: string; keep: DayActivity; cancel: DayActivity; holiday?: boolean }
type Week = { n: number; dates: string; focus: string; days: Day[] }
type Phase = { id: number; name: string; period: string; accent: string; tag: string; weeks: Week[] }

const phases: Phase[] = [
  {
    id: 1,
    name: "🏋️ Phase 1: Base Building",
    period: "Jun 1 – Jul 5",
    accent: "#1a5f85",
    tag: "5 weeks",
    weeks: [
      {
        n: 1, dates: "Jun 1 – Jun 7", focus: "Wake up the body",
        days: [
          {
            label: "Mon Jun 1", timing: "🌙 7pm+", holiday: true,
            keep: { type: "Gym – Cardio", detail: "Public holiday — gym may be closed. If open: Treadmill 1 min run / 2 min walk × 8 (24 min). Otherwise do the outdoor version." },
            cancel: { type: "Outdoor Run", detail: "Public holiday — enjoy the cooler morning. Walk/run: 1 min jog / 2 min walk × 8. 24 min total." }
          },
          {
            label: "Tue", timing: "😴 Rest",
            keep: { type: "Rest", detail: "Full rest." },
            cancel: { type: "Rest", detail: "Full rest." }
          },
          {
            label: "Wed", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "3×12 goblet squat, 3×10 lunges each leg, 3×12 leg press, 3×30s plank, 3×15 glute bridges." },
            cancel: { type: "Bodyweight Strength", detail: "3×15 bodyweight squats, 3×10 lunges, 3×15 glute bridges, 3×30s plank, 3×15 calf raises. Do at home." }
          },
          {
            label: "Thu", timing: "😴 Rest",
            keep: { type: "Rest", detail: "Full rest." },
            cancel: { type: "Rest", detail: "Full rest." }
          },
          {
            label: "Fri", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Same intervals as Monday. Try to feel slightly stronger." },
            cancel: { type: "Outdoor Run", detail: "Same walk/run intervals as Monday." }
          },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Outdoor Run", detail: "30–40 min easy walk/run outside. Morning is cooler — enjoy it. No pace pressure." },
            cancel: { type: "Outdoor Run", detail: "30–40 min easy walk/run. Morning coolness is your friend." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Play padel if scheduled. Otherwise full rest." },
            cancel: { type: "Padel or Rest", detail: "Play padel if scheduled. Otherwise full rest." }
          },
        ]
      },
      {
        n: 2, dates: "Jun 8 – Jun 14", focus: "Increase run intervals",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Treadmill: 1.5 min run / 1.5 min walk × 8 rounds." },
            cancel: { type: "Outdoor Run", detail: "1.5 min jog / 1.5 min walk × 8 outside." }
          },
          { label: "Tue", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Wed", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Add light weight to squats. 3×12 squats, 3×10 lunges, 3×15 leg press, 3×40s plank, 3×15 calf raises." },
            cancel: { type: "Bodyweight Strength", detail: "3×15 squats, 3×12 lunges, 3×15 glute bridges, 3×40s plank, 3×20 calf raises. Add a backpack with books for resistance if needed." }
          },
          { label: "Thu", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Fri", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Same intervals. Focus on steady breathing rhythm." },
            cancel: { type: "Outdoor Run", detail: "Same intervals. Notice: evening runs are cooler — use that advantage." }
          },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Outdoor Run", detail: "35–40 min walk/run, relaxed pace. Practice running outside vs treadmill feel." },
            cancel: { type: "Outdoor Run", detail: "35–40 min walk/run. Morning long run becomes your most important session each week." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Padel or rest." },
            cancel: { type: "Padel or Rest", detail: "Padel or rest." }
          },
        ]
      },
      {
        n: 3, dates: "Jun 15 – Jun 21", focus: "Push the run longer",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "2 min run / 1 min walk × 8. You're running more than walking now!" },
            cancel: { type: "Outdoor Run", detail: "2 min jog / 1 min walk × 8. Keep pace comfortable." }
          },
          {
            label: "Tue Jun 16", timing: "😴 Rest", holiday: true,
            keep: { type: "Rest", detail: "Public holiday — full rest. Enjoy the day off." },
            cancel: { type: "Rest", detail: "Public holiday — full rest. Enjoy the day off." }
          },
          {
            label: "Wed", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Increase weight slightly. Add step-ups on bench 3×10 each leg. Core: plank + dead bug 3×10 each side." },
            cancel: { type: "Bodyweight Strength", detail: "Add step-ups on a chair/stairs 3×10 each leg. Squats, lunges, bridges, plank. Push reps up." }
          },
          { label: "Thu", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Fri", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Try 3 min run / 1 min walk × 6. Stepping up the run blocks." },
            cancel: { type: "Outdoor Run", detail: "3 min jog / 1 min walk × 6 outside." }
          },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Outdoor Run", detail: "First 3km attempt. Jog the whole thing if you can. Walk breaks allowed. Just finish 3km." },
            cancel: { type: "Outdoor Run", detail: "First 3km attempt. This is a milestone. Slow is fine." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Padel counts as cardio. Otherwise rest." },
            cancel: { type: "Padel or Rest", detail: "Padel or rest." }
          },
        ]
      },
      {
        n: 4, dates: "Jun 22 – Jun 28", focus: "Longer run blocks",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "3 min run / 1 min walk × 7. 28 min session." },
            cancel: { type: "Outdoor Run", detail: "3 min jog / 1 min walk × 7 outside." }
          },
          { label: "Tue", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Wed", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Full leg day. Squats, lunges, leg press, Romanian deadlift, step-ups. 3 sets each. Rest 60s between sets." },
            cancel: { type: "Bodyweight Strength", detail: "Squats 4×15, lunges 4×10, step-ups 3×10, single-leg bridges 3×12, plank 3×1min. This is your most important bodyweight session." }
          },
          { label: "Thu", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Fri", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Try 5 min continuous run / 1 min walk × 4. Do 4 min if 5 is too hard — no rush." },
            cancel: { type: "Outdoor Run", detail: "5 min jog / 1 min walk × 4 outside. Evening air is cooler — good time to test longer intervals." }
          },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Outdoor Run", detail: "3.5–4km continuous. Saturday morning is your long run day — protect this slot." },
            cancel: { type: "Outdoor Long Run", detail: "3.5–4km. This is the most important session of your week." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Padel or rest." },
            cancel: { type: "Padel or Rest", detail: "Padel or rest." }
          },
        ]
      },
      {
        n: 5, dates: "Jun 29 – Jul 5", focus: "Last gym week / transition week",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "5 min run / 1 min walk × 5. Strong session — make the most of the gym." },
            cancel: { type: "Outdoor Run", detail: "5 min jog / 1 min walk × 5. You're building real running fitness now." }
          },
          { label: "Tue", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Wed", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Heavy-ish leg session. Best effort squats and leg press. Core finisher: 3×1 min plank." },
            cancel: { type: "Bodyweight Strength", detail: "Full circuit, max effort. Squats, lunges, step-ups, bridges, plank. 4 sets. Sweat." }
          },
          { label: "Thu", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Fri", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Lighter run session. 3km continuous run on treadmill. Steady pace. Stretch well after." },
            cancel: { type: "Outdoor Run", detail: "3km easy jog. Wind down the week." }
          },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Outdoor Long Run", detail: "4km continuous outdoor run. No gym — get used to the road. July is all outdoors." },
            cancel: { type: "Outdoor Long Run", detail: "4km continuous. You're ready for Phase 2." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Padel or rest. Gym membership likely expiring soon — mentally shift to outdoor mode." },
            cancel: { type: "Padel or Rest", detail: "Padel or rest. You've built a solid base." }
          },
        ]
      },
    ]
  },
  {
    id: 2,
    name: "🏃 Phase 2: Distance Building",
    period: "Jul 6 – Aug 20",
    accent: "#1e6b2b",
    tag: "7 weeks",
    weeks: [
      {
        n: 6, dates: "Jul 6 – Jul 12", focus: "First full outdoor week",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Run", detail: "3km outdoor evening run. Slow pace ~9–10 min/km. Enjoy the cooler air." },
            cancel: { type: "Run", detail: "3km outdoor evening run. Consistent pace." }
          },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Squats, lunges, leg press, plank. 3 sets. Maintenance strength work." },
            cancel: { type: "Bodyweight Strength", detail: "Home circuit: squats 3×15, lunges 3×10, step-ups 3×10, plank 3×45s." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          {
            label: "Thu", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Same as Tuesday, or swap for a light 3km treadmill run if gym is closer." },
            cancel: { type: "Bodyweight Strength", detail: "Same as Tuesday." }
          },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest before long run." }, cancel: { type: "Rest", detail: "Rest before long run." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run", detail: "4km morning run. Coolest time of day. Bring water." },
            cancel: { type: "Long Run", detail: "4km morning. This is your key session of the week." }
          },
          {
            label: "Sun", timing: "😴 Rest / 🏓 Padel",
            keep: { type: "Padel or Rest", detail: "Padel or easy walk." },
            cancel: { type: "Padel or Rest", detail: "Padel or easy walk." }
          },
        ]
      },
      {
        n: 7, dates: "Jul 13 – Jul 19", focus: "Build to 5km",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "4km evening run." }, cancel: { type: "Run", detail: "4km evening run." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Add 1 set to each exercise. Squats 4×12, lunges 4×10, leg press 4×12, plank 4×40s." },
            cancel: { type: "Bodyweight Strength", detail: "Increase sets: 4×15 squats, 4×12 lunges, 4×12 step-ups, 4×50s plank." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Run", detail: "4km run, slightly faster feel than Monday." }, cancel: { type: "Run", detail: "4km run, slightly faster." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Protect energy for Saturday." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run ⭐ 5km", detail: "FIRST 5KM! Walk if needed but finish the distance. This is a real milestone." },
            cancel: { type: "Long Run ⭐ 5km", detail: "FIRST 5KM! Slow is fine. Walk if needed. Just finish it." }
          },
          { label: "Sun", timing: "😴 Rest / 🏓 Padel", keep: { type: "Rest", detail: "Celebrate the 5km. Full rest." }, cancel: { type: "Rest", detail: "Celebrate. Full rest." } },
        ]
      },
      {
        n: 8, dates: "Jul 20 – Jul 26", focus: "Consolidate 5km",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "4.5km evening run." }, cancel: { type: "Run", detail: "4.5km evening run." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Squats 4×15, lunges 4×10, leg press 4×15, plank 3×1min. Solid session." },
            cancel: { type: "Bodyweight Strength", detail: "Squats 4×20, lunges 4×12, step-ups 4×12, single-leg bridges 3×12, plank 3×1min." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Run", detail: "4km at a slightly faster pace. Practice running at race effort." }, cancel: { type: "Run", detail: "4km slightly faster. Race pace practice." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run – 5.5km", detail: "5.5km. Should feel more comfortable than last week's 5km. Conversational pace." },
            cancel: { type: "Long Run – 5.5km", detail: "5.5km. You're growing into a runner." }
          },
          { label: "Sun", timing: "😴 Rest / 🏓 Padel", keep: { type: "Rest", detail: "Rest. Stretch hips, calves, quads." }, cancel: { type: "Rest", detail: "Rest. Stretch well." } },
        ]
      },
      {
        n: 9, dates: "Jul 27 – Aug 2", focus: "Push to 6km",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "5km evening run." }, cancel: { type: "Run", detail: "5km evening run." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Add single-leg glute bridges 3×12 each side. Standard leg circuit." },
            cancel: { type: "Bodyweight Strength", detail: "Add single-leg glute bridges 3×12 each side. Full circuit." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Run", detail: "4.5km faster pace. Start working on 9 min/km target." }, cancel: { type: "Run", detail: "4.5km, pace practice." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run – 6km", detail: "6km. Walk the last km if needed. Keep moving forward." },
            cancel: { type: "Long Run – 6km", detail: "6km. You're halfway to 10km distance." }
          },
          { label: "Sun", timing: "😴 Rest / 🏓 Padel", keep: { type: "Rest", detail: "Full rest. Halfway there." }, cancel: { type: "Rest", detail: "Full rest." } },
        ]
      },
      {
        n: 10, dates: "Aug 3 – Aug 9", focus: "Reach 7km",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "5.5km evening run." }, cancel: { type: "Run", detail: "5.5km evening run." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Full circuit 4 sets each. 45s rest. Sweat it out." },
            cancel: { type: "Bodyweight Strength", detail: "Full circuit 4 sets each. Add water bottle as resistance for step-ups." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Run", detail: "5km steady. Consistent 9 min/km pace goal." }, cancel: { type: "Run", detail: "5km steady pace. Practice race rhythm." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Big run tomorrow." }, cancel: { type: "Rest", detail: "Rest. Big run tomorrow." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run ⭐ 7km", detail: "7KM. Huge. Take water. Run/walk as needed. Finish the distance." },
            cancel: { type: "Long Run ⭐ 7km", detail: "7KM. Your biggest run so far. Water mandatory. Finish it." }
          },
          { label: "Sun", timing: "😴 Rest / 🏓 Padel", keep: { type: "Rest", detail: "Full rest. You can run 7km. The 10km is reachable." }, cancel: { type: "Rest", detail: "Full rest. Believe in the process." } },
        ]
      },
      {
        n: 11, dates: "Aug 10 – Aug 16", focus: "Build confidence — 8km",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "5km easy evening run." }, cancel: { type: "Run", detail: "5km easy evening run." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Lighter session, 3 sets. Focus on form over weight." },
            cancel: { type: "Bodyweight Strength", detail: "Light circuit, 3 sets. No strain." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Run", detail: "5.5km comfortable run." }, cancel: { type: "Run", detail: "5.5km comfortable run." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Singapore in one week." }, cancel: { type: "Rest", detail: "Rest. Singapore in one week." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Long Run ⭐ 8km", detail: "8KM. Your pre-Singapore confidence run. Slow pace. Water. You've got this." },
            cancel: { type: "Long Run ⭐ 8km", detail: "8KM. Final big effort before Singapore. Slow and steady wins." }
          },
          { label: "Sun", timing: "😴 Rest / 🏓 Padel", keep: { type: "Rest", detail: "Full rest. Start thinking about Singapore packing." }, cancel: { type: "Rest", detail: "Full rest. Pack for Singapore." } },
        ]
      },
      {
        n: 12, dates: "Aug 17 – Aug 20", focus: "Easy taper before travel",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "4km loose easy jog." }, cancel: { type: "Easy Run", detail: "4km loose easy jog." } },
          { label: "Tue", timing: "🌙 7pm+", keep: { type: "Light Strength", detail: "20 min easy: squats, lunges, plank. Low intensity." }, cancel: { type: "Light Bodyweight", detail: "20 min easy: squats, lunges, plank. Low intensity." } },
          { label: "Wed", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Final packing." }, cancel: { type: "Rest", detail: "Rest. Final packing." } },
          { label: "Thu Aug 20", timing: "😴 Rest", keep: { type: "Rest", detail: "Full rest before travel day." }, cancel: { type: "Rest", detail: "Full rest before travel day." } },
        ]
      },
    ]
  },
  {
    id: 3,
    name: "✈️ Singapore",
    period: "Aug 21 – 25",
    accent: "#7d5200",
    tag: "Active Rest",
    weeks: [
      {
        n: 13, dates: "Aug 21 – Aug 25", focus: "Enjoy it — this IS your training",
        days: [
          {
            label: "Fri–Mon", timing: "🌞 All day",
            keep: { type: "Active Tourism", detail: "8–15km of walking daily naturally. No structured runs. This is active rest. Your body is adapting to heat and humidity — exactly what race day feels like." },
            cancel: { type: "Active Tourism", detail: "8–15km of walking daily. No structured runs. The heat exposure is bonus race prep." }
          },
          {
            label: "Tue Aug 25", timing: "🌞 All day", holiday: true,
            keep: { type: "Active Tourism", detail: "Public holiday — last day in Singapore. Easy walking, sightseeing. Rest up for the flight home tomorrow." },
            cancel: { type: "Active Tourism", detail: "Public holiday — last day in Singapore. Take it easy, rest the legs." }
          },
          {
            label: "Key tip", timing: "💧",
            keep: { type: "Hydration", detail: "Drink water constantly. Singapore heat + humidity is intense. This mimics race conditions." },
            cancel: { type: "Hydration", detail: "Drink water constantly. Wear comfortable walking shoes — your legs are working hard." }
          },
        ]
      }
    ]
  },
  {
    id: 4,
    name: "🎯 Phase 3: Race Prep",
    period: "Aug 26 – Sep 12",
    accent: "#a82a4a",
    tag: "3 weeks",
    weeks: [
      {
        n: 14, dates: "Aug 26 – Aug 31", focus: "Back from Singapore — reset",
        days: [
          { label: "Wed Aug 26", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "3–4km easy. Shake off travel. Don't force pace." }, cancel: { type: "Easy Run", detail: "3–4km easy shakeout." } },
          { label: "Thu", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest if legs feel tired from Singapore." }, cancel: { type: "Rest", detail: "Rest." } },
          { label: "Fri", timing: "🌙 7pm+", keep: { type: "Run", detail: "5km comfortable evening run." }, cancel: { type: "Run", detail: "5km comfortable run." } },
          {
            label: "Sat", timing: "☀️ Morning",
            keep: { type: "Gym – Strength", detail: "Leg strength session. Moderate weight, good form. Knee prep for race." },
            cancel: { type: "Bodyweight Strength", detail: "Full bodyweight circuit. Squats, lunges, step-ups, bridges. 4 sets." }
          },
          {
            label: "Sun", timing: "☀️ Morning",
            keep: { type: "Long Run ⭐ 9km", detail: "9KM — your final long run. Aim for 9 min/km. If you finish this, race day is just 1km more." },
            cancel: { type: "Long Run ⭐ 9km", detail: "9KM final long run. Water essential. You've done 8km before — one more km." }
          },
        ]
      },
      {
        n: 15, dates: "Sep 1 – Sep 7", focus: "Taper — reduce volume, keep sharpness",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Run", detail: "5km easy." }, cancel: { type: "Run", detail: "5km easy." } },
          {
            label: "Tue", timing: "🌙 7pm+",
            keep: { type: "Gym – Strength", detail: "Light session, 3 sets, moderate weight. Last strength session before race." },
            cancel: { type: "Bodyweight Strength", detail: "Light home circuit, 3 sets. Last strength session." }
          },
          { label: "Wed", timing: "😴 Rest / 🏓 Padel", keep: { type: "Padel or Rest", detail: "Padel or rest." }, cancel: { type: "Padel or Rest", detail: "Padel or rest." } },
          { label: "Thu", timing: "🌙 7pm+", keep: { type: "Race Pace Run", detail: "4km at target race pace (9 min/km). Practice how the pace feels — not too fast!" }, cancel: { type: "Race Pace Run", detail: "4km at 9 min/km. Get your body used to race rhythm." } },
          { label: "Fri", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
          { label: "Sat", timing: "☀️ Morning", keep: { type: "Easy Run", detail: "3km very easy morning run." }, cancel: { type: "Easy Run", detail: "3km very easy." } },
          { label: "Sun", timing: "😴 Rest", keep: { type: "Rest", detail: "Full rest." }, cancel: { type: "Rest", detail: "Full rest." } },
        ]
      },
      {
        n: 16, dates: "Sep 8 – Sep 12", focus: "Race week — protect the body",
        days: [
          { label: "Mon Sep 8", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "3km very light jog. Keep legs moving." }, cancel: { type: "Easy Run", detail: "3km very light jog." } },
          { label: "Tue Sep 9", timing: "😴 Rest", keep: { type: "Rest", detail: "Full rest." }, cancel: { type: "Rest", detail: "Full rest." } },
          { label: "Wed Sep 10", timing: "🌙 7pm+", keep: { type: "Activation Run", detail: "2km easy + 4 × 30s light accelerations. Wake the legs up, don't tire them." }, cancel: { type: "Activation Run", detail: "2km easy + 4 × 30s strides. Activate, don't drain." } },
          { label: "Thu Sep 11", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Lay out your race kit tonight. Check bib, shoes, socks." }, cancel: { type: "Rest", detail: "Rest. Prepare race kit tonight." } },
          { label: "Fri Sep 12", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Light stretch only. Eat well (carbs). Sleep by 10pm." }, cancel: { type: "Rest", detail: "Rest. Eat carbs. Sleep early." } },
        ]
      },
    ]
  }
]

const typeColors: Record<string, { bg: string; text: string }> = {
  "Gym – Cardio": { bg: "#dbeeff", text: "#1a5a80" },
  "Gym – Strength": { bg: "#e8d8ff", text: "#5a1a80" },
  "Light Strength": { bg: "#f0e8ff", text: "#5a1a80" },
  "Run": { bg: "#d4f5d4", text: "#1a6e1a" },
  "Long Run": { bg: "#a8e6a8", text: "#0d4d0d" },
  "Long Run ⭐ 5km": { bg: "#7dd87d", text: "#0d4d0d" },
  "Long Run ⭐ 7km": { bg: "#5ccc5c", text: "#083408" },
  "Long Run ⭐ 8km": { bg: "#3cbc3c", text: "#062806" },
  "Long Run ⭐ 9km": { bg: "#2aaa2a", text: "#041e04" },
  "Easy Run": { bg: "#c8f0c8", text: "#1a6e1a" },
  "Outdoor Run": { bg: "#d4f5d4", text: "#1a6e1a" },
  "Outdoor Long Run": { bg: "#a8e6a8", text: "#0d4d0d" },
  "Long Run – 5.5km": { bg: "#7dd87d", text: "#0d4d0d" },
  "Long Run – 6km": { bg: "#5ccc5c", text: "#083408" },
  "Bodyweight Strength": { bg: "#ffe8d4", text: "#804010" },
  "Light Bodyweight": { bg: "#fff0e0", text: "#804010" },
  "Rest": { bg: "#f0f0f0", text: "#666" },
  "Padel or Rest": { bg: "#fff0cc", text: "#806000" },
  "Active Tourism": { bg: "#fff3cc", text: "#806000" },
  "Hydration": { bg: "#cce8ff", text: "#003366" },
  "Race Pace Run": { bg: "#ffd4d4", text: "#800000" },
  "Activation Run": { bg: "#ffc8c8", text: "#800000" },
}

export default function WorkoutPlan() {
  const [scenario, setScenario] = useState<Scenario>("keep")
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)
  const [expandedWeek, setExpandedWeek] = useState<string | null>(null)

  const togglePhase = (id: number) => setExpandedPhase(expandedPhase === id ? null : id)
  const toggleWeek = (phaseId: number, weekN: number) => {
    const key = `${phaseId}-${weekN}`
    setExpandedWeek(expandedWeek === key ? null : key)
  }

  const sc = GYM_SCENARIOS[scenario]

  return (
    <div className={styles.page}>
      <div className={styles.back}>
        <Link to="/">← Home</Link>
      </div>

      <header className={styles.header}>
        <p className={styles.label}>15-Week Training Plan</p>
        <h1 className={styles.title}>Singapore + 10km Race</h1>
        <p className={styles.subtitle}>Jun 1 → September 13 · Target: under 90 min</p>
        <p className={styles.subtitleSmall}>Weekdays after 7pm · Weekend mornings</p>
      </header>

      <div className={styles.scenarioCard}>
        <p className={styles.scenarioCardLabel}>Gym membership?</p>
        <div className={styles.scenarioToggle}>
          {(Object.entries(GYM_SCENARIOS) as [Scenario, (typeof GYM_SCENARIOS)[Scenario]][]).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              className={`${styles.scenarioBtn} ${scenario === key ? styles.scenarioBtnActive : ""}`}
              style={scenario === key ? { background: s.color } : undefined}
              aria-pressed={scenario === key}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <p className={styles.scenarioDesc} style={{ background: sc.bg }}>
          {sc.desc}
        </p>
      </div>

      <div className={styles.timeline}>
        {[
          { label: "Gym", color: "#1a5f85", flex: 5 },
          { label: "Outdoor", color: "#1e6b2b", flex: 7 },
          { label: "SG", color: "#7d5200", flex: 1 },
          { label: "Race Prep", color: "#a82a4a", flex: 3 },
        ].map(s => (
          <div key={s.label} className={styles.timelineSegment} style={{ flex: s.flex }}>
            <div className={styles.timelineBar} style={{ background: s.color }} />
            <span className={styles.timelineLabel} style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div className={styles.phases}>
        {phases.map(phase => {
          const isPhaseOpen = expandedPhase === phase.id
          return (
            <div key={phase.id}>
              <button
                className={styles.phaseHeader}
                style={{ background: phase.accent }}
                onClick={() => togglePhase(phase.id)}
                aria-expanded={isPhaseOpen}
              >
                <div>
                  <div className={styles.phaseName}>{phase.name}</div>
                  <div className={styles.phasePeriod}>{phase.period}</div>
                </div>
                <div className={styles.phaseRight}>
                  <span className={styles.phaseTag}>{phase.tag}</span>
                  <span className={styles.phaseChevron}>{isPhaseOpen ? "▲" : "▼"}</span>
                </div>
              </button>

              {isPhaseOpen && (
                <div className={styles.weeks}>
                  {phase.weeks.map(week => {
                    const key = `${phase.id}-${week.n}`
                    const isOpen = expandedWeek === key
                    return (
                      <div key={week.n} className={styles.weekCard}>
                        <button
                          className={styles.weekHeader}
                          style={isOpen ? { background: `${phase.accent}18` } : undefined}
                          onClick={() => toggleWeek(phase.id, week.n)}
                          aria-expanded={isOpen}
                        >
                          <div>
                            <span className={styles.weekTitle}>Week {week.n}</span>
                            <span className={styles.weekDates}>{week.dates}</span>
                            <div className={styles.weekFocus} style={{ color: phase.accent }}>📍 {week.focus}</div>
                          </div>
                          <span className={styles.weekChevron} style={{ color: phase.accent }}>
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className={styles.days}>
                            {week.days.map((day, i) => {
                              const d = day[scenario]
                              const tc = typeColors[d.type] ?? { bg: "#eee", text: "#333" }
                              return (
                                <div key={i} className={styles.day}>
                                  <div className={styles.dayMeta}>
                                    <div className={styles.dayLabel}>
                                      {day.label}
                                      {day.holiday && <span className={styles.holidayBadge}>PH</span>}
                                    </div>
                                    <div className={styles.dayTiming}>{day.timing}</div>
                                  </div>
                                  <div className={styles.dayContent}>
                                    <span
                                      className={styles.activityBadge}
                                      style={{ background: tc.bg, color: tc.text }}
                                    >
                                      {d.type}
                                    </span>
                                    <p className={styles.activityDetail}>{d.detail}</p>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className={styles.raceDay}>
        <div className={styles.raceDayTitle}>🏁 Race Day</div>
        <p className={styles.raceDaySubtitle}>September 13 · 10km · Target: under 90 minutes</p>
        {[
          "Start SLOW — first 2km should feel almost too easy",
          "Target pace: 9 min/km (or 9:30 for first half)",
          "Walk 1 min every 3km if needed — planned walk breaks are smart",
          "Hydrate at every water station",
          "Last 2km: give what you have left",
          "Goal: finish under 90 min. 15 weeks of work. Do it."
        ].map((tip, i) => (
          <div key={i} className={styles.raceTip}>
            <span className={styles.raceTipArrow}>→</span>
            <span className={styles.raceTipText}>{tip}</span>
          </div>
        ))}
        <div className={styles.raceDayFinish}>Cross that finish line. 🎉</div>
      </div>

      <p className={styles.pageHint}>Toggle gym scenario above · Tap phase to expand · Tap week for daily details</p>
    </div>
  )
}
