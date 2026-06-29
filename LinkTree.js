const ModaLinkGlobal = document.querySelector("#linkAddModal");
const LinkName = document.querySelector("#LinkName");
const LinkUrl = document.querySelector("#LinkUrl");
const btnOpenModal = document.querySelector("#btnOpenModal");
const btnSave = document.querySelector("#btnSave");
const ContainerMain = document.querySelector("#linkListContainer");
const Alertmain = document.querySelector("#alertmain");
const btnDelete = document.querySelector("#btnDelete");
const btnCloseModal = document.querySelector("#btnCloseModal");
const btnclearalllinks = document.querySelector("#btnclearalllinks");
const btnfileexport = document.querySelector("#btnfileexport");
const fileInput = document.querySelector("#fileInput");
const btnfilexportout = document.querySelector("#btnfilexportout");
let LinksCards = [];
let controlFlagUrl;
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]',
);

tooltipTriggerList.forEach(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
);

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showClass: {
    popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
  },
  hideClass: {
    popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
  },
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

ModaLinkGlobal.addEventListener("show.bs.modal", () => {
  LinkName.value = LinkUrl.value = "";
});

btnCloseModal.addEventListener("click", () => {
  Swal.fire({
    title: "Uyarı",
    text: "Çıkmak istediğinize emin misiniz?",
    icon: "warning",
    showClass: {
      popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
    },
    hideClass: {
      popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
    },
    showCancelButton: true,
    confirmButtonText: "Evet, çık",
    cancelButtonText: "Hayır",
  }).then((result) => {
    if (result.isConfirmed) {
      HideModal();
    }
  });
});

btnfilexportout.addEventListener("click", () => {});

btnclearalllinks.addEventListener("click", () => {
  if (document.querySelectorAll(".link-item-wrapper").length > 0) {
    Swal.fire({
      title: "Uyarı",
      text: "Tüm linkleri temizlemek istediğinize emin misiniz?",
      icon: "warning",
      showClass: {
        popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
      },
      hideClass: {
        popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
      },
      showCancelButton: true,
      confirmButtonText: "Evet",
      cancelButtonText: "Vazgeç",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("LinkCards");
        LinksCards = [];
        renderNotes();
      }
    });
  } else {
    Swal.fire({
      title: "Uyarı",
      text: "Silinecek herhangi bir link bulunamadı.",
      icon: "warning",
      showClass: {
        popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
      },
      hideClass: {
        popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
      },
      confirmButtonText: "Tamam",
    });
  }
});

btnfileexport.addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", () => {
  const fileselect = fileInput.files[0];
  if (!fileselect) return;
  if (fileselect.type !== "application/json") {
    // todo slect file type control
    Toast.fire({
      icon: "error",
      title: "Dosya JSON formatında olmalı",
    });
    return;
  }
  const reader = new FileReader(); // todo dosya okuyucu yapısı takip
  reader.onload = function (e) {
    // todo dosya yüklendigi zaman bu yapı çalışır
    const data = JSON.parse(e.target.result);
    data.forEach((item) => {
      CreatLink(item.title, item.url);
    });
  };
  reader.readAsText(fileselect);
});

btnDelete.addEventListener("click", () => {
  LinkName.value = "";
  LinkUrl.value = "";
});

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && e.key.toUpperCase() === "C") {
    e.preventDefault();
    btnOpenModal.click();
  }
  if (e.ctrlKey && e.altKey && e.key.toUpperCase() === "L") {
    e.preventDefault();
    btnclearalllinks.click();
  }
  if (e.ctrlKey && e.altKey && e.key.toUpperCase() === "F") {
    e.preventDefault();
    btnfileexport.click();
  }
  if (e.ctrlKey && e.altKey && e.key.toUpperCase() === "O") {
    e.preventDefault();
    btnfilexportout.click();
  }
});

ModaLinkGlobal.addEventListener("keydown", (e) => {
  if (
    (e.ctrlKey && e.altKey && e.key.toUpperCase() === "K") ||
    e.key === "Enter"
  ) {
    e.preventDefault();
    btnSave.click();
  }
  if (e.ctrlKey && e.altKey && e.key.toUpperCase() === "D") {
    e.preventDefault();
    btnDelete.click();
  }
  if (e.key === "Escape") {
    e.preventDefault();
    btnCloseModal.click();
  }
});

ModaLinkGlobal.addEventListener("shown.bs.modal", () => {
  LinkName.focus();
});

btnOpenModal.addEventListener("click", () => {
  ShowModal();
});

document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
});

btnSave.addEventListener("click", async () => {
  controlFlagUrl = false;
  const linkname = LinkName.value.trim();
  const linkurl = LinkUrl.value.trim();

  if (linkname === "" || linkurl === "") {
    CreatAlertMessage("Url ve link adı boş olamaz.");
    return;
  }

  if (!linkurl.includes("https://")) {
    CreatAlertMessage("Lütfen geçerli bir url giriniz.");
    return;
  }
  const urlExists = await checkUrl(linkurl);

  if (!urlExists) {
    CreatAlertMessage("Bu web adresine ulaşılamıyor.");
    return;
  }

  const allcardslink = document.querySelectorAll(".link-item-wrapper");
  for (let i = 0; i < allcardslink.length; i++) {
    const url = allcardslink[i].querySelector(".link-card").href.trim();
    if (url === linkurl) {
      controlFlagUrl = true;
      break;
    }
  }

  if (controlFlagUrl === true) {
    CreatAlertMessage(
      "Bu link önceden eklenmiştir. Lütfen yeni bir link giriniz.",
    );
    return;
  }

  CreatLink(linkname, linkurl);
});

function CreatLink(LinkName, Url) {
  const linkmaindiv = document.createElement("div");
  const link = document.createElement("a");
  const cardBody = document.createElement("div");
  const flex = document.createElement("div");
  const linkarrow = document.createElement("div");
  const linkListContainer = document.createElement("div");
  const linkicon = document.createElement("i");
  const linkiconright = document.createElement("i");
  const title = document.createElement("h5");
  linkmaindiv.className = "link-item-wrapper mb-3 transition-all";
  link.href = Url;
  link.target = "_blank";
  link.className = "card link-card shadow-sm border-0 text-decoration-none";
  linkicon.className = LinkIcon(link.href.trim().toLowerCase());
  cardBody.className =
    "card-body d-flex align-items-center justify-content-between py-3 px-4";
  flex.className = "d-flex align-items-center";
  linkListContainer.className =
    "link-icon-container d-flex align-items-center justify-content-center me-3 rounded-circle text-bg-light";
  title.className = "card-title mb-1 text-dark fw-semibold";
  title.textContent = LinkName;
  linkarrow.className = "link-arrow text-secondary";
  linkiconright.className = "fa-solid fa-chevron-right";
  linkListContainer.appendChild(linkicon);
  flex.appendChild(linkListContainer);
  flex.appendChild(title);
  linkarrow.appendChild(linkiconright);
  cardBody.appendChild(flex);
  cardBody.appendChild(linkarrow);
  link.appendChild(cardBody);
  linkmaindiv.appendChild(link);
  ContainerMain.appendChild(linkmaindiv);
  let Card = {
    id: crypto.randomUUID(),
    title: LinkName,
    url: Url,
    icon: linkicon.className,
  };
  LinksCards.push(Card);
  savestroge();
  renderNotes();
  HideModal();
}

function CreatAlertMessage(Text) {
  const div = document.createElement("div");
  const btn = document.createElement("button");
  div.className = "alert alert-warning alert-dismissible";
  div.role = "alert";
  div.textContent = Text;
  btn.type = "button";
  btn.className = "btn-close";
  btn.setAttribute("data-bs-dismiss", "alert");
  btn.setAttribute("aria-label", "close");
  div.appendChild(btn);
  Alertmain.appendChild(div);
}

function savestroge() {
  localStorage.setItem("LinkCards", JSON.stringify(LinksCards));
}

function loadFromStorage() {
  let data = localStorage.getItem("LinkCards");
  if (data) {
    LinksCards = JSON.parse(data);
  } else {
    LinksCards = [];
  }
  renderNotes();
}

function renderNotes() {
  ContainerMain.innerHTML = "";
  LinksCards.forEach((card) => {
    const linkmaindiv = document.createElement("div");
    const link = document.createElement("a");
    linkmaindiv.className = "link-item-wrapper mb-3 transition-all";
    link.href = card.url;
    link.target = "_blank";
    link.className = "card link-card shadow-sm border-0 text-decoration-none";
    link.innerHTML = `
      <div class="card-body d-flex align-items-center justify-content-between py-3 px-4">
        <div class="d-flex align-items-center">
          <div class="link-icon-container d-flex align-items-center justify-content-center me-3 rounded-circle text-bg-light">
            <i class="${card.icon}"></i>
          </div>
          <h5 class="card-title mb-0 text-dark fw-semibold">
            ${card.title}
          </h5>
        </div>
        <div class="d-flex align-items-center gap-2">
          <div class="link-arrow text-secondary">
            <i class="fa-solid fa-chevron-right"></i>
          </div>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${card.id}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
    const deleteBtn = link.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      Swal.fire({
        icon: "warning",
        title: "Uyarı",
        text: "Seçili linki silmek istediğinize eminmisiniz?",
        showClass: {
          popup: `
        animate__animated
        animate__fadeInUp
        animate__faster
      `,
        },
        hideClass: {
          popup: `
        animate__animated
        animate__fadeOutDown
        animate__faster
      `,
        },
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonColor: "red",
        confirmButtonText: "Sil",
        cancelButtonText: "Vazgeç",
      }).then((result) => {
        if (result.isConfirmed) {
          deleteLink(card.id);
        }
      });
    });

    linkmaindiv.appendChild(link);
    ContainerMain.appendChild(linkmaindiv);
  });
}

function deleteLink(id) {
  LinksCards = LinksCards.filter((card) => card.id !== id);
  savestroge();
  renderNotes();
}

async function checkUrl(url) {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, 5000);
    fetch(url, {
      method: "GET",
      mode: "no-cors",
      signal: controller.signal,
    })
      .then(() => {
        clearTimeout(timeout);
        resolve(true);
      })
      .catch(() => {
        const img = new Image();

        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };

        img.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };
        img.src = url + "/favicon.ico?" + Date.now();
      });
  });
}

function HideModal() {
  bootstrap.Modal.getOrCreateInstance(ModaLinkGlobal).hide();
}

function ShowModal() {
  bootstrap.Modal.getOrCreateInstance(ModaLinkGlobal).show();
}

function LinkIcon(url) {
  if (url.toLowerCase().includes("youtube")) {
    return "fa-brands fa-youtube fa-sm text-danger";
  } else if (url.toLowerCase().includes("tiktok")) {
    return "fa-brands fa-tiktok fa-lg text-dark";
  } else if (url.toLowerCase().includes("whatsapp")) {
    return "fa-brands fa-whatsapp fa-lg text-success";
  } else if (url.toLowerCase().includes("instagram")) {
    return "fa-brands fa-instagram fa-lg text-danger";
  } else if (url.toLowerCase().includes("facebook")) {
    return "fa-brands fa-facebook fa-lg text-primary";
  } else if (
    url.toLowerCase().includes("twitter") ||
    url.toLowerCase().includes("x.com")
  ) {
    return "fa-brands fa-x-twitter fa-lg text-dark";
  } else if (url.toLowerCase().includes("linkedin")) {
    return "fa-brands fa-linkedin fa-lg text-primary";
  } else if (url.toLowerCase().includes("github")) {
    return "fa-brands fa-github fa-lg text-dark";
  } else if (url.toLowerCase().includes("gitlab")) {
    return "fa-brands fa-gitlab fa-lg text-orange";
  } else if (url.toLowerCase().includes("discord")) {
    return "fa-brands fa-discord fa-lg text-primary";
  } else if (url.toLowerCase().includes("telegram")) {
    return "fa-brands fa-telegram fa-lg text-info";
  } else if (url.toLowerCase().includes("reddit")) {
    return "fa-brands fa-reddit fa-lg text-danger";
  } else if (url.toLowerCase().includes("twitch")) {
    return "fa-brands fa-twitch fa-lg text-purple";
  } else if (url.toLowerCase().includes("spotify")) {
    return "fa-brands fa-spotify fa-lg text-success";
  } else if (url.toLowerCase().includes("apple")) {
    return "fa-brands fa-apple fa-lg text-dark";
  } else if (url.toLowerCase().includes("google")) {
    return "fa-brands fa-google fa-lg text-danger";
  } else if (url.toLowerCase().includes("amazon")) {
    return "fa-brands fa-amazon fa-lg text-warning";
  } else if (
    url.toLowerCase().includes("microsoft") ||
    url.toLowerCase().includes("office")
  ) {
    return "fa-brands fa-microsoft fa-lg text-primary";
  } else if (url.toLowerCase().includes("paypal")) {
    return "fa-brands fa-paypal fa-lg text-primary";
  } else if (url.toLowerCase().includes("steam")) {
    return "fa-brands fa-steam fa-lg text-dark";
  } else if (url.toLowerCase().includes("behance")) {
    return "fa-brands fa-behance fa-lg text-primary";
  } else if (url.toLowerCase().includes("dribbble")) {
    return "fa-brands fa-dribbble fa-lg text-danger";
  } else if (url.toLowerCase().includes("pinterest")) {
    return "fa-brands fa-pinterest fa-lg text-danger";
  } else if (url.toLowerCase().includes("snapchat")) {
    return "fa-brands fa-snapchat fa-lg text-warning";
  } else if (url.toLowerCase().includes("wordpress")) {
    return "fa-brands fa-wordpress fa-lg text-primary";
  } else if (url.toLowerCase().includes("medium")) {
    return "fa-brands fa-medium fa-lg text-dark";
  } else if (url.toLowerCase().includes("stackoverflow")) {
    return "fa-brands fa-stack-overflow fa-lg text-warning";
  } else if (
    url.toLowerCase().includes("chat.openai") ||
    url.toLowerCase().includes("openai")
  ) {
    return "fa-brands fa-openai fa-lg text-dark";
  } else if (url.toLowerCase().includes("chatgpt")) {
    return "fa-brands fa-openai fa-lg text-dark";
  } else if (
    url.toLowerCase().includes("gemini") ||
    url.toLowerCase().includes("bard")
  ) {
    return "fa-solid fa-sparkles fa-lg text-primary";
  } else if (url.toLowerCase().includes("claude")) {
    return "fa-solid fa-brain fa-lg text-warning";
  } else if (url.toLowerCase().includes("perplexity")) {
    return "fa-solid fa-magnifying-glass fa-lg text-info";
  } else if (url.toLowerCase().includes("huggingface")) {
    return "fa-solid fa-face-smile fa-lg text-warning";
  } else if (url.toLowerCase().includes("replicate")) {
    return "fa-solid fa-microchip fa-lg text-dark";
  } else if (url.toLowerCase().includes("docker")) {
    return "fa-brands fa-docker fa-lg text-primary";
  } else if (url.toLowerCase().includes("npm")) {
    return "fa-brands fa-npm fa-lg text-danger";
  } else if (url.toLowerCase().includes("python")) {
    return "fa-brands fa-python fa-lg text-primary";
  } else if (
    url.toLowerCase().includes("aws") ||
    url.toLowerCase().includes("amazonaws")
  ) {
    return "fa-brands fa-aws fa-lg text-warning";
  } else if (url.toLowerCase().includes("firebase")) {
    return "fa-solid fa-fire fa-lg text-warning";
  } else if (url.toLowerCase().includes("vercel")) {
    return "fa-solid fa-triangle-exclamation fa-lg text-dark";
  } else if (url.toLowerCase().includes("netlify")) {
    return "fa-solid fa-globe fa-lg text-info";
  } else if (url.toLowerCase().includes("figma")) {
    return "fa-brands fa-figma fa-lg text-danger";
  } else if (url.toLowerCase().includes("canva")) {
    return "fa-solid fa-palette fa-lg text-primary";
  } else if (url.toLowerCase().includes("dropbox")) {
    return "fa-brands fa-dropbox fa-lg text-primary";
  } else if (url.toLowerCase().includes("drive.google")) {
    return "fa-brands fa-google-drive fa-lg text-success";
  } else if (url.toLowerCase().includes("notion")) {
    return "fa-solid fa-note-sticky fa-lg text-dark";
  } else if (url.toLowerCase().includes("shopify")) {
    return "fa-brands fa-shopify fa-lg text-success";
  } else if (url.toLowerCase().includes("etsy")) {
    return "fa-solid fa-store fa-lg text-warning";
  } else if (url.toLowerCase().includes("ebay")) {
    return "fa-solid fa-cart-shopping fa-lg text-primary";
  } else if (url.toLowerCase().includes("substack")) {
    return "fa-solid fa-newspaper fa-lg text-dark";
  } else if (url.toLowerCase().includes("rss")) {
    return "fa-solid fa-rss fa-lg text-warning";
  } else {
    return "fa-solid fa-link fa-lg text-secondary";
  }
}
