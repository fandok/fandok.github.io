import { useState } from "react"
import { Link } from "react-router-dom"

type Scenario = "keep" | "cancel"

const GYM_SCENARIOS: Record<Scenario, { label: string; icon: string; color: string; bg: string; desc: string }> = {
  keep: {
    label: "Keep Gym",
    icon: "🏋️",
    color: "#2a7fa8",
    bg: "#dbeeff",
    desc: "Gym available throughout. Best for knee protection & rainy nights."
  },
  cancel: {
    label: "Cancel Gym",
    icon: "🏃",
    color: "#2e8b3a",
    bg: "#d4f5d4",
    desc: "Outdoor + bodyweight only. Still achievable — need more discipline on strength days."
  }
}

type DayActivity = { type: string; detail: string }
type Day = { label: string; timing: string; keep: DayActivity; cancel: DayActivity }
type Week = { n: number; dates: string; focus: string; days: Day[] }
type Phase = { id: number; name: string; period: string; accent: string; lightBg: string; tag: string; weeks: Week[] }

const phases: Phase[] = [
  {
    id: 1,
    name: "🏋️ Phase 1: Base Building",
    period: "May 28 – Jun 29",
    accent: "#2a7fa8",
    lightBg: "#e8f4f8",
    tag: "5 weeks",
    weeks: [
      {
        n: 1, dates: "May 28 – Jun 1", focus: "Wake up the body",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "Treadmill: 1 min run / 2 min walk × 8 rounds (24 min). Cooldown 10 min walk." },
            cancel: { type: "Outdoor Run", detail: "Walk/run outside: 1 min jog / 2 min walk × 8. 24 min total. Any flat road or park." }
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
        n: 2, dates: "Jun 2 – Jun 8", focus: "Increase run intervals",
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
        n: 3, dates: "Jun 9 – Jun 15", focus: "Push the run longer",
        days: [
          {
            label: "Mon", timing: "🌙 7pm+",
            keep: { type: "Gym – Cardio", detail: "2 min run / 1 min walk × 8. You're running more than walking now!" },
            cancel: { type: "Outdoor Run", detail: "2 min jog / 1 min walk × 8. Keep pace comfortable." }
          },
          { label: "Tue", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest." }, cancel: { type: "Rest", detail: "Rest." } },
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
        n: 4, dates: "Jun 16 – Jun 22", focus: "Longer run blocks",
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
        n: 5, dates: "Jun 23 – Jun 29", focus: "Last gym week / transition week",
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
    period: "Jun 30 – Aug 14",
    accent: "#2e8b3a",
    lightBg: "#edfaed",
    tag: "7 weeks",
    weeks: [
      {
        n: 6, dates: "Jun 30 – Jul 6", focus: "First full outdoor week",
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
        n: 7, dates: "Jul 7 – Jul 13", focus: "Build to 5km",
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
        n: 8, dates: "Jul 14 – Jul 20", focus: "Consolidate 5km",
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
        n: 9, dates: "Jul 21 – Jul 27", focus: "Push to 6km",
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
        n: 10, dates: "Jul 28 – Aug 3", focus: "Reach 7km",
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
        n: 11, dates: "Aug 4 – Aug 10", focus: "Build confidence — 8km",
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
        n: 12, dates: "Aug 11 – Aug 14", focus: "Easy taper before travel",
        days: [
          { label: "Mon", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "4km loose easy jog." }, cancel: { type: "Easy Run", detail: "4km loose easy jog." } },
          { label: "Tue", timing: "🌙 7pm+", keep: { type: "Light Strength", detail: "20 min easy: squats, lunges, plank. Low intensity." }, cancel: { type: "Light Bodyweight", detail: "20 min easy: squats, lunges, plank. Low intensity." } },
          { label: "Wed", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Final packing." }, cancel: { type: "Rest", detail: "Rest. Final packing." } },
          { label: "Thu Aug 14", timing: "😴 Rest", keep: { type: "Rest", detail: "Full rest before travel day." }, cancel: { type: "Rest", detail: "Full rest before travel day." } },
        ]
      },
    ]
  },
  {
    id: 3,
    name: "✈️ Singapore",
    period: "Aug 15 – 19",
    accent: "#b07800",
    lightBg: "#fff8e8",
    tag: "Active Rest",
    weeks: [
      {
        n: 13, dates: "Aug 15 – Aug 19", focus: "Enjoy it — this IS your training",
        days: [
          {
            label: "All 5 days", timing: "🌞 All day",
            keep: { type: "Active Tourism", detail: "8–15km of walking daily naturally. No structured runs. This is active rest. Your body is adapting to heat and humidity — exactly what race day feels like." },
            cancel: { type: "Active Tourism", detail: "8–15km of walking daily. No structured runs. The heat exposure is bonus race prep." }
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
    period: "Aug 20 – Sep 5",
    accent: "#a82a4a",
    lightBg: "#f8eef0",
    tag: "3 weeks",
    weeks: [
      {
        n: 14, dates: "Aug 20 – Aug 24", focus: "Back from Singapore — reset",
        days: [
          { label: "Wed Aug 20", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "3–4km easy. Shake off travel. Don't force pace." }, cancel: { type: "Easy Run", detail: "3–4km easy shakeout." } },
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
        n: 15, dates: "Aug 25 – Aug 31", focus: "Taper — reduce volume, keep sharpness",
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
        n: 16, dates: "Sep 1 – Sep 5", focus: "Race week — protect the body",
        days: [
          { label: "Mon Sep 1", timing: "🌙 7pm+", keep: { type: "Easy Run", detail: "3km very light jog. Keep legs moving." }, cancel: { type: "Easy Run", detail: "3km very light jog." } },
          { label: "Tue Sep 2", timing: "😴 Rest", keep: { type: "Rest", detail: "Full rest." }, cancel: { type: "Rest", detail: "Full rest." } },
          { label: "Wed Sep 3", timing: "🌙 7pm+", keep: { type: "Activation Run", detail: "2km easy + 4 × 30s light accelerations. Wake the legs up, don't tire them." }, cancel: { type: "Activation Run", detail: "2km easy + 4 × 30s strides. Activate, don't drain." } },
          { label: "Thu Sep 4", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Lay out your race kit tonight. Check bib, shoes, socks." }, cancel: { type: "Rest", detail: "Rest. Prepare race kit tonight." } },
          { label: "Fri Sep 5", timing: "😴 Rest", keep: { type: "Rest", detail: "Rest. Light stretch only. Eat well (carbs). Sleep by 10pm." }, cancel: { type: "Rest", detail: "Rest. Eat carbs. Sleep early." } },
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
  "Long Run ⭐ 9km": { bg: "#3cbc3c", text: "#062806" },
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

  const toggleWeek = (phaseId: number, weekN: number) => {
    const key = `${phaseId}-${weekN}`
    setExpandedWeek(expandedWeek === key ? null : key)
  }

  const sc = GYM_SCENARIOS[scenario]

  return (
    <div style={{
      fontFamily: "'Georgia', serif",
      background: "#f7f5f2",
      minHeight: "100vh",
      padding: "20px 16px 40px",
      maxWidth: 680,
      margin: "0 auto",
    }}>
      <div style={{ marginBottom: 16 }}>
        <Link to="/" style={{ color: "#999", textDecoration: "none", fontSize: 13 }}>← Home</Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#999", textTransform: "uppercase", marginBottom: 6 }}>15-Week Training Plan</div>
        <h1 style={{ fontSize: 24, fontWeight: "bold", color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.2 }}>
          Singapore + 10km Race
        </h1>
        <p style={{ color: "#777", fontSize: 13, margin: 0 }}>May 28 → September 6 · Target: under 90 min</p>
        <p style={{ color: "#999", fontSize: 12, margin: "4px 0 0" }}>Weekdays after 7pm · Weekend mornings</p>
      </div>

      {/* Gym Scenario Toggle */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 16, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 12, fontWeight: "bold", color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
          Gym membership?
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          {(Object.entries(GYM_SCENARIOS) as [Scenario, typeof GYM_SCENARIOS[Scenario]][]).map(([key, s]) => (
            <button
              key={key}
              onClick={() => setScenario(key)}
              style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, border: "none",
                cursor: "pointer", transition: "all 0.2s",
                background: scenario === key ? s.color : "#f0f0f0",
                color: scenario === key ? "#fff" : "#666",
                fontWeight: "bold", fontSize: 13,
              }}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>
        <div style={{
          background: sc.bg, borderRadius: 8, padding: "10px 12px",
          fontSize: 13, color: "#444", lineHeight: 1.5
        }}>
          {sc.desc}
        </div>
      </div>

      {/* Timeline bar */}
      <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
        {[
          { label: "Gym", color: "#2a7fa8", flex: 5 },
          { label: "Outdoor", color: "#2e8b3a", flex: 7 },
          { label: "SG", color: "#b07800", flex: 1 },
          { label: "Race Prep", color: "#a82a4a", flex: 3 },
        ].map(s => (
          <div key={s.label} style={{ flex: s.flex, textAlign: "center" }}>
            <div style={{ height: 5, background: s.color, borderRadius: 3, marginBottom: 3 }} />
            <div style={{ fontSize: 9, color: s.color, fontWeight: "bold", letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Phases */}
      {phases.map(phase => (
        <div key={phase.id} style={{ marginBottom: 16 }}>
          <div
            onClick={() => setExpandedPhase(expandedPhase === phase.id ? null : phase.id)}
            style={{
              background: phase.accent, color: "#fff", borderRadius: 12,
              padding: "14px 16px", cursor: "pointer",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12)"
            }}
          >
            <div>
              <div style={{ fontSize: 16, fontWeight: "bold" }}>{phase.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>{phase.period}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: "bold" }}>{phase.tag}</span>
              <span style={{ fontSize: 16 }}>{expandedPhase === phase.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expandedPhase === phase.id && (
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
              {phase.weeks.map(week => {
                const key = `${phase.id}-${week.n}`
                const isOpen = expandedWeek === key
                return (
                  <div key={week.n} style={{
                    background: "#fff", borderRadius: 10, overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    border: `1px solid ${phase.accent}20`
                  }}>
                    <div
                      onClick={() => toggleWeek(phase.id, week.n)}
                      style={{
                        padding: "12px 14px", cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: isOpen ? phase.lightBg : "#fff",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: "bold", color: "#1a1a1a", fontSize: 14 }}>Week {week.n}</span>
                        <span style={{ marginLeft: 8, fontSize: 12, color: "#999" }}>{week.dates}</span>
                        <div style={{ fontSize: 12, color: phase.accent, marginTop: 2 }}>📍 {week.focus}</div>
                      </div>
                      <span style={{ color: phase.accent, fontSize: 16, fontWeight: "bold" }}>{isOpen ? "−" : "+"}</span>
                    </div>

                    {isOpen && (
                      <div style={{ padding: "0 14px 12px" }}>
                        {week.days.map((day, i) => {
                          const d = day[scenario]
                          const tc = typeColors[d.type] ?? { bg: "#eee", text: "#333" }
                          return (
                            <div key={i} style={{
                              display: "flex", gap: 10, padding: "10px 0",
                              borderTop: `1px solid ${i === 0 ? phase.accent + "20" : "#f0f0f0"}`,
                              alignItems: "flex-start"
                            }}>
                              <div style={{ minWidth: 44 }}>
                                <div style={{ fontSize: 11, fontWeight: "bold", color: "#888" }}>{day.label}</div>
                                <div style={{ fontSize: 10, color: "#bbb" }}>{day.timing}</div>
                              </div>
                              <div style={{ flex: 1 }}>
                                <span style={{
                                  display: "inline-block",
                                  background: tc.bg, color: tc.text,
                                  borderRadius: 4, padding: "2px 8px",
                                  fontSize: 11, fontWeight: "bold", marginBottom: 4
                                }}>{d.type}</span>
                                <div style={{ fontSize: 13, color: "#444", lineHeight: 1.5 }}>{d.detail}</div>
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
      ))}

      {/* Race Day */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        borderRadius: 14, padding: "20px", color: "#fff",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)", marginTop: 8
      }}>
        <div style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4 }}>🏁 Race Day</div>
        <div style={{ fontSize: 13, color: "#aaa", marginBottom: 14 }}>September 6 · 10km · Target: under 90 minutes</div>
        {[
          "Start SLOW — first 2km should feel almost too easy",
          "Target pace: 9 min/km (or 9:30 for first half)",
          "Walk 1 min every 3km if needed — planned walk breaks are smart",
          "Hydrate at every water station",
          "Last 2km: give what you have left",
          "Goal: finish under 90 min. 15 weeks of work. Do it."
        ].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
            <span style={{ color: "#f0a500", fontSize: 13, marginTop: 1 }}>→</span>
            <span style={{ fontSize: 13, color: "#ddd", lineHeight: 1.5 }}>{tip}</span>
          </div>
        ))}
        <div style={{
          marginTop: 14, padding: "12px", background: "rgba(255,255,255,0.08)",
          borderRadius: 8, textAlign: "center", fontSize: 15, fontWeight: "bold", color: "#f0a500"
        }}>
          Cross that finish line. 🎉
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "#bbb" }}>
        Toggle gym scenario above · Tap phase to expand · Tap week for daily details
      </div>
    </div>
  )
}
