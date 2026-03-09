const pageTitleMap = {
  dashboard: "대시보드",
  "internal-listings": "매물 관리",
  buyers: "구매고객 관리",
  "external-feed": "외부 광고피드",
  "ai-queue": "AI 판단 큐",
  tasks: "작업함",
  "data-source": "데이터 소스",
};

const internalListings = [
  {
    id: "IN-0012",
    complex: "고덕그라시움",
    dong: "104",
    ho: "1502",
    price: "15.8억",
    verified: "2일 전",
    status: "활성",
    memo: "집주인 조정 여지 2천만",
  },
  {
    id: "IN-0088",
    complex: "고덕그라시움",
    dong: "103",
    ho: "902",
    price: "15.4억",
    verified: "오늘",
    status: "활성",
    memo: "급매 문의 다수",
  },
  {
    id: "IN-0134",
    complex: "청담래미안로이뷰",
    dong: "101",
    ho: "1201",
    price: "24.2억",
    verified: "4일 전",
    status: "검증필요",
    memo: "소유주 연락처 재확인 필요",
  },
  {
    id: "IN-0183",
    complex: "가락프라자",
    dong: "2",
    ho: "801",
    price: "11.1억",
    verified: "6일 전",
    status: "활성",
    memo: "입주 협의 가능",
  },
];

const buyers = [
  {
    name: "김서연",
    phone: "010-2104-8891",
    urgency: "급함",
    must: ["매매", "고덕그라시움", "34평대", "예산 16억 이하"],
    prefer: ["남향", "중층 이상", "즉시 입주"],
    lastContact: "오늘",
  },
  {
    name: "박지훈",
    phone: "010-3310-2290",
    urgency: "보통",
    must: ["매매", "강동구", "예산 12억 이하"],
    prefer: ["역세권", "주차 2대", "학군"],
    lastContact: "2일 전",
  },
  {
    name: "이민지",
    phone: "010-7124-0911",
    urgency: "급함",
    must: ["전세", "송파구", "25평 이상", "예산 8억 이하"],
    prefer: ["신축", "엘리베이터", "반려동물"],
    lastContact: "어제",
  },
];

const externalFeed = [
  {
    type: "대표",
    isNew: true,
    repNo: "2609890584",
    complex: "고덕자이",
    dong: "103",
    floor: "9/28",
    unitType: "84A / 34평",
    price: "15.1억",
    checkedAt: "2026-02-22",
    state: "신규",
  },
  {
    type: "중복",
    isNew: true,
    repNo: "2609890584",
    complex: "고덕자이",
    dong: "103",
    floor: "12/28",
    unitType: "84A / 34평",
    price: "15.3억",
    checkedAt: "2026-02-22",
    state: "신규",
  },
  {
    type: "대표",
    isNew: false,
    repNo: "2609845802",
    complex: "청담래미안로이뷰",
    dong: "101",
    floor: "9/16",
    unitType: "110 / 43평",
    price: "24.0억",
    checkedAt: "2026-02-21",
    state: "변경",
  },
  {
    type: "대표",
    isNew: true,
    repNo: "2609900867",
    complex: "고덕그라시움",
    dong: "104",
    floor: "17/35",
    unitType: "84B / 34평",
    price: "15.0억",
    checkedAt: "2026-02-22",
    state: "신규",
  },
  {
    type: "대표",
    isNew: false,
    repNo: "2609731864",
    complex: "청담래미안로이뷰",
    dong: "101",
    floor: "5/16",
    unitType: "110 / 43평",
    price: "24.6억",
    checkedAt: "2026-02-20",
    state: "유지",
  },
];

const aiQueue = [
  {
    mode: "internal_better",
    verifyRequired: true,
    title: "고덕그라시움 104동 광고 매물과 내부 보유 매물 매칭",
    buyer: "김서연",
    fit: 94,
    opportunity: 88,
    risk: 63,
    reasons: [
      "동/평형/거래유형이 내부 IN-0012와 거의 일치",
      "외부 광고가 8천만 낮음 (시세대비 -4.9%)",
      "호수 미공개라 동일 물건 여부 전화 검증 필요",
    ],
  },
  {
    mode: "external_recommend",
    verifyRequired: false,
    title: "내부 미보유: 고덕자이 103동 34평 매물 고객 추천 후보",
    buyer: "김서연",
    fit: 91,
    opportunity: 86,
    risk: 28,
    reasons: [
      "고객 Must 조건 전부 충족",
      "예산 상한 대비 9천만 여유",
      "최근 확인일자 최신, 광고 활동량 높음",
    ],
  },
  {
    mode: "external_recommend",
    verifyRequired: true,
    title: "내부 미보유: 청담래미안로이뷰 101동 고층 매물 추천 검토",
    buyer: "박지훈",
    fit: 72,
    opportunity: 58,
    risk: 67,
    reasons: [
      "지역/면적은 적합하나 예산 상한 초과 가능성",
      "층/방향은 선호 조건에 부합",
      "가격 협상 가능 여부 확인 후 제안 권장",
    ],
  },
];

const tasks = [
  {
    label: "전화 확인",
    detail: "고덕그라시움 104동 광고(2609900867) 동일 호수 여부 확인",
  },
  {
    label: "고객 제안",
    detail: "김서연 고객에게 고덕자이 103동 34평 2건 비교안 전달",
  },
  {
    label: "가격 검증",
    detail: "청담래미안로이뷰 광고가 시세 하단인지 재확인",
  },
];

function renderDashboard() {
  const metrics = [
    {
      title: "신규 외부광고",
      value: externalFeed.filter((row) => row.isNew).length,
      sub: "파란행 기준",
    },
    {
      title: "내부매물 매칭 후보",
      value: aiQueue.filter((q) => q.mode === "internal_better").length,
      sub: "호수 미공개 매칭 포함",
    },
    {
      title: "고객 추천 후보",
      value: aiQueue.filter((q) => q.mode === "external_recommend").length,
      sub: "내부 미보유 포함",
    },
    {
      title: "검증 필요",
      value: aiQueue.filter((q) => q.verifyRequired).length,
      sub: "사람 승인 전 확인",
    },
  ];

  document.getElementById("dashboard-metrics").innerHTML = metrics
    .map(
      (m) => `
      <article class="card metric fade-up">
        <h4>${m.title}</h4>
        <p>${m.value}</p>
        <span class="sub">${m.sub}</span>
      </article>
    `,
    )
    .join("");

  document.getElementById("dashboard-updates").innerHTML = `
    <li><strong>고덕그라시움 104동</strong><span>외부 신규 3건 유입</span></li>
    <li><strong>고덕자이 103동</strong><span>내부 대비 저가 후보 감지</span></li>
    <li><strong>청담래미안로이뷰</strong><span>광고 가격 변동(-0.6억)</span></li>
  `;

  document.getElementById("dashboard-risks").innerHTML = `
    <li><strong>호수 미확인</strong><span>동/평형만 일치한 광고 2건</span></li>
    <li><strong>예산 초과 가능</strong><span>박지훈 고객 추천 후보 1건</span></li>
    <li><strong>메모 갱신 필요</strong><span>내부 매물 1건 확인일 6일 경과</span></li>
  `;
}

function renderInternalListings() {
  document.getElementById("internal-listings-body").innerHTML = internalListings
    .map((item) => {
      const statusClass =
        item.status === "활성" ? "tag success" : "tag warning";
      return `
        <tr>
          <td>${item.id}</td>
          <td>${item.complex}</td>
          <td>${item.dong}동 ${item.ho}호</td>
          <td><strong>${item.price}</strong></td>
          <td>${item.verified}</td>
          <td><span class="${statusClass}">${item.status}</span></td>
          <td>${item.memo}</td>
        </tr>
      `;
    })
    .join("");
}

function renderBuyers() {
  document.getElementById("buyers-grid").innerHTML = buyers
    .map(
      (buyer) => `
      <article class="card buyer-card fade-up">
        <div class="buyer-head">
          <div>
            <h3 class="buyer-name">${buyer.name}</h3>
            <p class="buyer-phone">${buyer.phone}</p>
          </div>
          <span class="tag ${buyer.urgency === "급함" ? "warning" : ""}">${buyer.urgency}</span>
        </div>
        <span class="label">Must 조건</span>
        <div class="chips">${buyer.must.map((v) => `<span class="chip">${v}</span>`).join("")}</div>
        <span class="label">Prefer 조건</span>
        <div class="chips">${buyer.prefer.map((v) => `<span class="chip">${v}</span>`).join("")}</div>
        <span class="label">최근 연락</span>
        <div class="row-inline">
          <span class="chip">${buyer.lastContact}</span>
          <button class="btn-small primary">추천 보기</button>
        </div>
      </article>
    `,
    )
    .join("");
}

function renderExternalFeed(showNewOnly = false) {
  const rows = showNewOnly
    ? externalFeed.filter((row) => row.isNew)
    : externalFeed;
  document.getElementById("external-feed-body").innerHTML = rows
    .map((row) => {
      const rowClass = row.isNew ? "new-row" : "";
      const stateClass =
        row.state === "신규"
          ? "tag success"
          : row.state === "변경"
            ? "tag warning"
            : "tag";
      return `
        <tr class="${rowClass}">
          <td>${row.type}</td>
          <td>${row.repNo}</td>
          <td>${row.complex}</td>
          <td>${row.dong}</td>
          <td>${row.floor}</td>
          <td>${row.unitType}</td>
          <td><strong>${row.price}</strong></td>
          <td>${row.checkedAt}</td>
          <td><span class="${stateClass}">${row.state}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderAiQueue(riskOnly = false) {
  const rows = riskOnly ? aiQueue.filter((row) => row.verifyRequired) : aiQueue;
  document.getElementById("ai-queue-list").innerHTML = rows
    .map((row) => {
      const modeTag =
        row.mode === "internal_better"
          ? '<span class="tag warning">내부 매칭 개선안</span>'
          : '<span class="tag success">외부 추천 후보</span>';
      const riskTag = row.verifyRequired
        ? '<span class="tag danger">검증필요</span>'
        : '<span class="tag success">즉시제안 가능</span>';
      return `
        <article class="queue-card">
          <div class="queue-head">
            <h4 class="queue-title">${row.title}</h4>
            <div class="row-inline">${modeTag}${riskTag}</div>
          </div>
          <p class="queue-meta">대상 고객: <strong>${row.buyer}</strong></p>
          <div class="score-row">
            <div class="score"><p>적합도</p><strong>${row.fit}</strong></div>
            <div class="score"><p>기회점수</p><strong>${row.opportunity}</strong></div>
            <div class="score"><p>리스크</p><strong>${row.risk}</strong></div>
          </div>
          <ul class="reason-list">${row.reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>
          <div class="queue-actions">
            <button class="btn-small primary">승인</button>
            <button class="btn-small warning">보류</button>
            <button class="btn-small danger">제외</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderTasks() {
  document.getElementById("task-list").innerHTML = tasks
    .map(
      (task) => `
      <li>
        <strong>${task.label}</strong>
        <span>${task.detail}</span>
      </li>
    `,
    )
    .join("");
}

function bindNavigation() {
  const nav = document.getElementById("main-nav");
  const title = document.getElementById("page-title");
  const navItems = Array.from(nav.querySelectorAll(".nav-item"));
  const pages = Array.from(document.querySelectorAll(".page"));

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      const target = item.dataset.page;
      navItems.forEach((it) => it.classList.remove("active"));
      item.classList.add("active");

      pages.forEach((page) => page.classList.remove("active"));
      const selectedPage = document.getElementById(`page-${target}`);
      selectedPage.classList.add("active");
      title.textContent = pageTitleMap[target];
    });
  });
}

function bindFilters() {
  const newOnlyToggle = document.getElementById("new-only-toggle");
  const riskOnlyToggle = document.getElementById("risk-only-toggle");
  newOnlyToggle.addEventListener("change", (event) => {
    renderExternalFeed(event.target.checked);
  });
  riskOnlyToggle.addEventListener("change", (event) => {
    renderAiQueue(event.target.checked);
  });
}

renderDashboard();
renderInternalListings();
renderBuyers();
renderExternalFeed();
renderAiQueue();
renderTasks();
bindNavigation();
bindFilters();
