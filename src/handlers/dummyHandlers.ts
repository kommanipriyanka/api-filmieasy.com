import factory from "../factory";
import { sendResponse } from "../utils/sendResponse";

export const getDummyArtists = factory.createHandlers(async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(100, Number(c.req.query("limit") ?? 30)));
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();

  const departments = [
    "Art Department",
    "Direction Department",
    "Camera Department",
    "Production House",
    "Editing Department",
    "Music Department",
    "Make Up Department",
    "Costume Department",
  ];
  const statuses = ["Available", "Unavailable", "Partially Available"];
  const charges = ["$300/Day", "$400/Day", "$500/Day", "$600/Day", "$800/Day"];

  const totalItems = 200;
  const baseList = Array.from({ length: totalItems }, (_, i) => {
    const u = users[i % users.length];
    return {
      id: i + 1,
      full_name: u.name,
      email: u.email,
      department: departments[i % departments.length],
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      DOB: `19${70 + (i % 30)}-0${(i % 9) + 1}-15`,
      address: `${u.address.street}, ${u.address.city}`,
      charges: charges[i % charges.length],
      status: statuses[i % statuses.length],
    };
  });

  const start = (page - 1) * limit;
  const paged = baseList.slice(start, start + limit);

  const meta = {
    page,
    limit,
    total: baseList.length,
    totalPages: Math.ceil(baseList.length / limit),
  };

  return sendResponse(c, 200, "Fetched dummy artists", { meta, records: paged });
});

export const getDummyProjects = factory.createHandlers(async (c) => {
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(100, Number(c.req.query("limit") ?? 20)));

  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();
  const statuses = ["Ongoing", "Completed", "Delayed", "Not Started"];
  const budgets = ["1L/50CR", "2L/60CR", "5L/80CR", "10L/90CR", "12L/100CR"];
  const memberCounts = [10, 15, 18, 20, 25, 30];

  const totalItems = 100;
  const allProjects = Array.from({ length: totalItems }, (_, i) => {
    const p = posts[i % posts.length];
    return {
      id: i + 1,
      project_name: p.title.split(" ").slice(0, 3).join(" "),
      description: "Project description here",
      timeline: "Start Date - End Date",
      budget: budgets[i % budgets.length],
      members: `${memberCounts[i % memberCounts.length]} Members`,
      scene: `Scene ${Math.floor(Math.random() * 80) + 1}/80`,
      status: statuses[i % statuses.length],
      address: `${p.id * 10} Elm St, Mumbai`,
    };
  });
  const start = (page - 1) * limit;
  const paged = allProjects.slice(start, start + limit);
  const meta = {
    page,
    limit,
    total: allProjects.length,
    totalPages: Math.ceil(allProjects.length / limit),
  };

  return sendResponse(c, 200, "Fetched dummy projects", { meta, records: paged });
});

export const getDummyArtist = factory.createHandlers(async (c) => {
  const id = Number(c.req.param("id") ?? 1);
  const res = await fetch(`https://jsonplaceholder.typicode.com/users/${((id - 1) % 10) + 1}`);
  const u = await res.json();
  const departments = ["Art Department", "Direction Department", "Camera Department", "Make Up Department"];
  const languagesPool = [["Hindi", "English"], ["English"], ["Tamil", "English"], ["Telugu", "English"]];
  const roleTypes = ["MAIN_LEAD", "SUPPORT", "DIRECTOR", "EDITOR"];
  const profile = {
    id,
    full_name: u.name,
    avatar: `https://i.pravatar.cc/150?img=${(id % 70) + 1}`, // avatar
    gender: id % 2 === 0 ? "FEMALE" : "MALE",
    DOB: `19${70 + (id % 30)}-0${(id % 9) + 1}-15`,
    email: u.email,
    phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
    address: `${u.address.street}, ${u.address.city}`,
    department: departments[id % departments.length],
    languages: languagesPool[id % languagesPool.length],
    role_type: roleTypes[id % roleTypes.length],
    talent_tags: ["Dance", "Drama", "Commercial"].slice(0, (id % 3) + 1),
    experience: `${5 + (id % 20)} years`,
    association: id % 2 === 0 ? "FWICE" : null,
    status: id % 3 === 0 ? "Unavailable" : "Available",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return sendResponse(c, 200, "Fetched dummy artist profile", profile);
});

export const getDummyArtistProjects = factory.createHandlers(async (c) => {
  const id = Number(c.req.param("id") ?? 1);
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(50, Number(c.req.query("limit") ?? 8)));
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();
  const statuses = ["Pre Production", "Shooting", "Post Production"];
  const budgets = ["₹12L / ₹100CR", "₹8L / ₹60CR", "₹32L / ₹50L"];
  const totalItems = 100;
  const allProjects = Array.from({ length: totalItems }, (_, i) => {
    const p = posts[i % posts.length];
    return {
      id: i + 1,
      title: p.title.split(" ").slice(0, 3).join(" "),
      cover_image: `https://picsum.photos/seed/project_${id}_${i}/360/240`,
      phase: statuses[i % statuses.length],
      timeline: "Jul 15 – Sep 10, 2025",
      budget: budgets[i % budgets.length],
      membersCount: 18 + (i % 6),
      scene: `Scene ${((i % 80) + 1)}/80`,

      avatars: [
        `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
        `https://i.pravatar.cc/40?img=${(i + 1) % 70 + 1}`,
        `https://i.pravatar.cc/40?img=${(i + 2) % 70 + 1}`,
      ],

      includesArtist: (i + id) % 3 !== 0,
    };
  });
  const start = (page - 1) * limit;
  const paged = allProjects.slice(start, start + limit);
  const meta = { page, limit, total: allProjects.length, totalPages: Math.ceil(allProjects.length / limit) };
  return sendResponse(c, 200, "Fetched dummy artist projects", { meta, records: paged });
});

export const getDummyProjectUsers = factory.createHandlers(async (c) => {
  const id = Number(c.req.param("id") ?? 1);
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(50, Number(c.req.query("limit") ?? 12)));

  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();

  const totalItems = 200;
  const statuses = ["Available", "Unavailable", "Partially Available"];
  const charges = ["$300/Day", "$400/Day", "$500/Day", "$600/Day", "$800/Day"];
  const departments = ["Art Department", "Direction Department", "Camera Department", "Make Up Department", "Costume Department"];

  const allMembers = Array.from({ length: totalItems }, (_, i) => {
    const u = users[i % users.length];
    return {
      id: i + 1,
      full_name: u.name,
      email: u.email,
      department: departments[i % departments.length],
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      DOB: `19${70 + (i % 30)}-0${(i % 9) + 1}-15`,
      address: `${u.address.street}, ${u.address.city}`,
      charges: charges[i % charges.length],
      status: statuses[i % statuses.length],
      avatar: `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
      role: (i % 2 === 0) ? "Actor" : "Crew",
    };
  });

  const projectMembers = allMembers.filter(m => (m.id + id) % 3 !== 0);
  const start = (page - 1) * limit;
  const paged = projectMembers.slice(start, start + limit);
  const meta = {
    page,
    limit,
    total: projectMembers.length,
    totalPages: Math.ceil(projectMembers.length / limit),
  };

  return sendResponse(c, 200, "Fetched project users", { meta, records: paged });
});

export const getDummyProject = factory.createHandlers(async (c) => {
  const id = Number(c.req.param("id") ?? 1);
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${((id - 1) % 100) + 1}`);
  const p = await res.json();
  const statuses = ["Ongoing", "Completed", "Pre Production", "Shooting"];
  const budgetOptions = ["₹12L / ₹100CR", "₹8L / ₹60CR", "₹32L / ₹50L"];
  const project = {
    id,
    project_name: String(p.title).slice(0, 60),
    description: p.body || "Project description here",
    timeline: "Jul 15 – Sep 10, 2025",
    budget: budgetOptions[id % budgetOptions.length],
    scene: `Scene ${((id % 80) + 1)}/80`,
    status: statuses[id % statuses.length],
    cover_image: `https://picsum.photos/seed/project_${id}/640/360`,
    membersCount: 18 + (id % 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return sendResponse(c, 200, "Fetched dummy project", project);
});

export const getDummyProjectScenes = factory.createHandlers(async (c) => {
  const projectId = Number(c.req.param("id") ?? 1);
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(50, Number(c.req.query("limit") ?? 8)));
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();
  const totalItems = 120;
  const allScenes = Array.from({ length: totalItems }, (_, i) => {
    const p = posts[i % posts.length];
    const sceneNumber = i + 1;
    const indoor = (i % 2) === 0;
    return {
      id: sceneNumber,
      scene_number: sceneNumber,
      title: String(p.title).slice(0, 40),
      description: p.body.slice(0, 200),
      location_label: indoor ? "INT. WAREHOUSE" : "EXT. MUMBAI STREET",
      indoorOutdoor: indoor ? "Indoor" : "Outdoor",
      time_of_day: (i % 3 === 0) ? "Night" : ((i % 3 === 1) ? "Day" : "Evening"),
      weather_dependency: (i % 5) === 0,
      status: (i % 4 === 0) ? "Pending" : (i % 4 === 1 ? "Planned" : "Confirmed"),
      warning: (i % 11 === 0) ? "Rain alert for this scene" : null,
      tags: ["Action", "Dialog", "VFX"].slice(0, (i % 3) + 1),
      scheduled_date: `2025-09-${String((i % 28) + 1).padStart(2, "0")}`,
      start_time: `${(8 + (i % 10)).toString().padStart(2, "0")}:00`,
      duration_minutes: 15 + (i % 5) * 10,
      thumbnail: `https://picsum.photos/seed/scene_${projectId}_${i}/360/200`,
      crew: [
        { name: `Director ${((i % 7) + 1)}`, role: "Director" },
        { name: `DOP ${((i % 6) + 1)}`, role: "DOP" },
        { name: `Gaffer ${((i % 5) + 1)}`, role: "Lighting" },
      ],
    };
  });
  const start = (page - 1) * limit;
  const paged = allScenes.slice(start, start + limit);
  const meta = { page, limit, total: allScenes.length, totalPages: Math.ceil(allScenes.length / limit) };
  return sendResponse(c, 200, "Fetched project scenes", { data: paged, meta });
});

export const getDummyProjectSceneById = factory.createHandlers(async (c) => {
  const projectId = Number(c.req.param("id") ?? 1);
  const sceneId = Number(c.req.param("sceneId") ?? 1);

  // reuse posts for textual content
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${((sceneId - 1) % 100) + 1}`);
  const p = await res.json();

  const indoor = (sceneId % 2) === 0;
  const detail = {
    id: sceneId,
    scene_number: sceneId,
    title: String(p.title),
    description: `${p.body}\n\nFull scene description and action lines here.`,
    location_label: indoor ? "INT. WAREHOUSE – NIGHT" : "EXT. MUMBAI STREET – DAY",
    indoorOutdoor: indoor ? "Indoor" : "Outdoor",
    time_of_day: (sceneId % 3 === 0) ? "Night" : ((sceneId % 3 === 1) ? "Day" : "Evening"),
    weather_dependency: (sceneId % 5) === 0,
    status: (sceneId % 4 === 0) ? "Pending" : "Confirmed",
    warning: (sceneId % 11 === 0) ? "Rain alert — consider indoor replacement" : null,
    tags: ["Action", "Drama", "Rain"][sceneId % 3 ? (sceneId % 3) : 0],
    scheduled_date: `2025-09-${String((sceneId % 28) + 1).padStart(2, "0")}`,
    start_time: `${(8 + (sceneId % 10)).toString().padStart(2, "0")}:00`,
    duration_minutes: 20 + (sceneId % 6) * 5,
    thumbnails: [
      `https://picsum.photos/seed/scene_detail_${projectId}_${sceneId}_1/600/320`,
      `https://picsum.photos/seed/scene_detail_${projectId}_${sceneId}_2/600/320`,
    ],
    // detailed crew & roles (for right-side panel)
    crew: [
      { name: "Meera - Main Lead", role: "Actor" },
      { name: "Priya Nair", role: "Stunt Double" },
      { name: "Rohan Mehta", role: "Director" },
      { name: "Aarav Kapoor", role: "DOP" },
      { name: "Sita Iyer", role: "Sound Recordist" },
      { name: "Raj Malhotra", role: "Stunt Coordinator" },
    ],
    notes: [
      { id: 1, text: "Bring rain machines", author: "1st AD" },
      { id: 2, text: "Check permits for location", author: "Producer" },
    ],
    location_details: {
      name: indoor ? "Warehouse A - Interior" : "Marine Drive - Street",
      address: indoor ? "Warehouse Complex" : "Marine Drive, Mumbai",
      indoorOutdoor: indoor ? "Indoor" : "Outdoor",
      weather_dependency: (sceneId % 5) === 0,
    },
  };

  return sendResponse(c, 200, "Fetched scene detail", detail);
});

export const getDummyProjectPayments = factory.createHandlers(async (c) => {
  const projectId = Number(c.req.param("id") ?? 1);
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(50, Number(c.req.query("limit") ?? 10)));
  const res = await fetch("https://jsonplaceholder.typicode.com/users");
  const users = await res.json();
  const totalItems = 50;
  const methods = ["Online", "Cash", "Bank Transfer", "UPI"];
  const statuses = ["Paid", "Pending", "Over Paid"];
  const payments = Array.from({ length: totalItems }, (_, i) => {
    const u = users[i % users.length];
    const amount = 2000 + ((i % 6) * 500);
    const status = statuses[i % statuses.length];
    return {
      id: i + 1,
      payment_date: new Date(2024, (i % 12), ((i % 26) + 1)).toISOString().split("T")[0], // YYYY-MM-DD
      crew: {
        id: u.id,
        name: u.name,
        email: u.email,
        department: ["Art Department", "Camera Department", "Direction Department"][i % 3],
        avatar: `https://i.pravatar.cc/40?img=${(i % 70) + 1}`,
      },
      payment_method: methods[i % methods.length],
      amount,
      status,
      receipt_url: `https://example.com/receipts/project_${projectId}_payment_${i + 1}.pdf`,
    };
  });
  const totalAmount = payments.reduce((s, p) => s + p.amount, 0);
  const amountPaid = payments.filter(p => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === "Pending").reduce((s, p) => s + p.amount, 0);
  const overPaid = payments.filter(p => p.status === "Over Paid").reduce((s, p) => s + p.amount, 0);
  const start = (page - 1) * limit;
  const paged = payments.slice(start, start + limit);
  const meta = { page, limit, total: payments.length, totalPages: Math.ceil(payments.length / limit) };
  const payload = { summary: { totalAmount, amountPaid, pendingAmount, overPaid }, meta, records: paged };
  return sendResponse(c, 200, "Fetched project payments", payload);
});
export const getDummyProjectSchedules = factory.createHandlers(async (c) => {
  const projectId = Number(c.req.param("id") ?? 1);
  const month = Math.max(1, Math.min(12, Number(c.req.query("month") ?? (new Date().getMonth() + 1))));
  const year = Math.max(1970, Number(c.req.query("year") ?? new Date().getFullYear()));
  const tab = String(c.req.query("tab") ?? "upcoming").toLowerCase(); // upcoming|completed|missed
  const page = Math.max(1, Number(c.req.query("page") ?? 1));
  const limit = Math.max(1, Math.min(50, Number(c.req.query("limit") ?? 8)));
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  const posts = await res.json();
  const totalItems = 125;
  const statuses = ["Upcoming", "Completed", "Missed"];
  const colors = { Upcoming: "orange", Completed: "green", Missed: "red" };
  const allSchedules = Array.from({ length: totalItems }, (_, i) => {
    const p = posts[i % posts.length];
    const day = ((i % 28) + 1);
    const scheduleMonth = ((month - 1 + Math.floor(i / 28)) % 12) + 1;
    const scheduleYear = year + Math.floor((month - 1 + Math.floor(i / 28)) / 12);
    const rawStatus = statuses[i % statuses.length];
    return {
      id: i + 1,
      scene_number: i + 1,
      title: String(p.title).slice(0, 40),
      description: String(p.body).slice(0, 180),
      date: `${String(scheduleYear).padStart(4, "0")}-${String(scheduleMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`, // YYYY-MM-DD
      start_time: `${String(8 + (i % 10)).padStart(2, "0")}:00`,
      end_time: `${String(9 + (i % 10)).padStart(2, "0")}:00`,
      location: (i % 2 === 0) ? "EXT. MUMBAI STREET – NIGHT" : "INT. WAREHOUSE – DAY",
      indoorOutdoor: (i % 2 === 0) ? "Outdoor" : "Indoor",
      weather_dependency: (i % 5 === 0),
      status: rawStatus,
      status_color: colors[rawStatus as keyof typeof colors],
      warning: (i % 11 === 0) ? "Rain alert for this scene" : null,
      crew_short: [
        { name: `Director ${(i % 7) + 1}`, role: "Director" },
        { name: `DOP ${(i % 6) + 1}`, role: "DOP" },
      ],
      thumbnail: `https://picsum.photos/seed/sched_${projectId}_${i}/320/180`,
    };
  });
  const schedulesForMonth = allSchedules.filter((s) => {
    const [y, m] = s.date.split("-").map(Number);
    return y === year && m === month;
  });
  let filtered = schedulesForMonth;
  if (tab === "upcoming")
    filtered = schedulesForMonth.filter(s => s.status === "Upcoming");
  else if (tab === "completed")
    filtered = schedulesForMonth.filter(s => s.status === "Completed");
  else if (tab === "missed")
    filtered = schedulesForMonth.filter(s => s.status === "Missed");
  const dateMap = new Map<string, { date: string; color: string; count: number }>();
  for (const s of schedulesForMonth) {
    const key = s.date;
    const existing = dateMap.get(key);
    const priority = (c: string) => (c === "green" ? 3 : c === "orange" ? 2 : 1);
    const color = s.status_color;
    if (!existing) {
      dateMap.set(key, { date: key, color, count: 1 });
    }
    else {
      // keep highest priority color
      if (priority(color) > priority(existing.color))
        existing.color = color;
      existing.count++;
      dateMap.set(key, existing);
    }
  }
  const calendar = Array.from(dateMap.values());
  const start = (page - 1) * limit;
  const summary = {
    totalSchedules: schedulesForMonth.length,
    completedSchedules: schedulesForMonth.filter(s => s.status === "Completed").length,
    pendingSchedules: schedulesForMonth.filter(s => s.status === "Upcoming").length,
    missedSchedules: schedulesForMonth.filter(s => s.status === "Missed").length,
  };
  const meta = { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) };
  return sendResponse(c, 200, "Fetched project schedules", {
    summary,
    calendar,
    meta,
  });
});
