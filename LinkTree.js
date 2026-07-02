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
const qrContainer = document.querySelector("#qrModalBody");
const qrcodemodal = document.querySelector("#qrModal");
const btnqrcode = document.querySelector("#btnqrcode");
const btncopyqrcode = document.querySelector("#btncopyqrcode");
const btnmodecontrol = document.querySelector("#btnmodecontrol");
const btnqrurlgo = document.querySelector("#btnqrurlgo");
const topscrool = document.querySelector("#topscrool");
const topscrooli = document.querySelector("#topscrool i");
let LinksCards = [];
let mode;
let controlFlagUrl;
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]',
);

fileInput.addEventListener("change", () => {
  const fileselect = fileInput.files[0];
  if (fileselect.type !== "application/json") {
    CreatAlertMessage("Dosya JSON formatında olmalı");
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    const data = JSON.parse(e.target.result);
    data.forEach((item) => {
      CreatLink(item.title.trim(), item.url.trim());
    });
  };
  reader.readAsText(fileselect);
});

btnmodecontrol.addEventListener("click", () => {
  if (!document.body.classList.contains("dark")) {
    document.body.classList.add("dark");
    btnmodecontrol.innerHTML = "<i class='fa-solid fa-sun me-1'></i> Açık mod";
    localStorage.setItem("Mode", "Dark");
  } else {
    document.body.classList.remove("dark");
    btnmodecontrol.innerHTML = "<i class='fa-solid fa-moon me-1'></i> Koyu mod";
    localStorage.setItem("Mode", "Light");
  }
  if (document.body.classList.contains("dark")) {
    mode = "dark";
  } else {
    mode = "";
  }
});

window.addEventListener("scroll", () => {
  ControlScroll();
});

topscrool.addEventListener("click", () => {
  document.documentElement.scrollTop = 0;
});

topscrool.addEventListener("mouseover", () => {
  topscrooli.className = "fa-solid fa-arrow-up fa-bounce";
});

topscrool.addEventListener("mouseout", () => {
  topscrooli.className = "fa-solid fa-arrow-up";
});

btnfilexportout.addEventListener("click", () => {
  const links = [];
  document.querySelectorAll(".link-item-wrapper").forEach((item) => {
    const title = item.querySelector(".card-title").textContent.trim();
    const url = item.querySelector(".link-card").href.trim();
    if (title && url) {
      links.push({
        title: title,
        url: url,
      });
    }
  });
  if (links.length === 0) {
    CreatAlertMessage("Dışa aktarılacak veri bulunamadı");
    return;
  }
  const json = JSON.stringify(links, null, 2);
  const blob = new Blob([json], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `links${new Date().toLocaleString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

btnDelete.addEventListener("click", () => {
  LinkName.value = LinkUrl.value = "";
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

qrcodemodal.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key.toUpperCase() === "D") {
    e.preventDefault();
    btnqrcode.click();
  }
  if (e.ctrlKey && e.key.toUpperCase() === "C") {
    e.preventDefault();
    btncopyqrcode.click();
  }
  if (e.ctrlKey && e.key.toUpperCase() === "G") {
    e.preventDefault();
    btnqrurlgo.click();
  }
});

ModaLinkGlobal.addEventListener("shown.bs.modal", () => {
  LinkName.focus();
});

btnOpenModal.addEventListener("click", () => {
  ShowModal(ModaLinkGlobal);
});

document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  ControlScroll();
  tooltipTriggerList.forEach(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl),
  );
  if (localStorage.getItem("Mode") === "Dark") {
    document.body.classList.add("dark");
    btnmodecontrol.innerHTML = "<i class='fa-solid fa-sun me-1'></i> Açık mod";
  } else {
    document.body.classList.remove("dark");
    btnmodecontrol.innerHTML = "<i class='fa-solid fa-moon me-1'></i> Koyu mod";
  }
  if (document.body.classList.contains("dark")) {
    mode = "dark";
  } else {
    mode = "";
  }
});

btnqrcode.addEventListener("click", () => {
  const qrcode = qrContainer.querySelector("img").src;
  fetch(qrcode)
    .then((res) => res.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qrcode-${new Date().toLocaleString()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
});

btncopyqrcode.addEventListener("click", async () => {
  const img = qrContainer.querySelector("img").src;
  const response = await fetch(img);
  const blob = await response.blob();
  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
  CreatAlertMessageSuccess("Qr kod kopyalandı");
});

btnqrurlgo.addEventListener("click", async () => {
  const img = qrContainer.querySelector("img").src;
  const canvas = document.createElement("canvas");
  const a = document.createElement("a");
  const ctx = canvas.getContext("2d");
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = img;
  image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, canvas.width, canvas.height);
    if (code) {
      a.href = code.data;
      a.target = "_blaknk";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      CreatAlertMessage("QR okunamadı");
    }
  };
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

btnclearalllinks.addEventListener("click", () => {
  if (document.querySelectorAll(".link-item-wrapper").length > 0) {
    SwalFire("Tüm linkleri temizlemek istediğinize emin misiniz?").then(
      (result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("LinkCards");
          LinksCards = [];
          renderNotes();
        }
      },
    );
  } else {
    CreatAlertMessage("Silinecek herhangi bir link bulunamadı.");
  }
});

btnfileexport.addEventListener("click", () => {
  fileInput.click();
});

ModaLinkGlobal.addEventListener("show.bs.modal", () => {
  LinkName.value = LinkUrl.value = "";
});

btnCloseModal.addEventListener("click", () => {
  SwalFire("Çıkmak istediğinize emin misiniz?").then((result) => {
    if (result.isConfirmed) {
      HideModal(ModaLinkGlobal);
    }
  });
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
  HideModal(ModaLinkGlobal);
}

function CreatAlertMessage(Text) {
  const ToastAlert = Swal.mixin({
    toast: true,
    theme: mode,
    position: "top-start",
    showClass: {
      popup: "animate__animated animate__slideInRight animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__slideOutRight animate__faster",
    },
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  ToastAlert.fire({
    icon: "warning",
    title: Text,
  });
}

function CreatAlertMessageSuccess(Text) {
  const ToastAlert = Swal.mixin({
    toast: true,
    theme: mode,
    position: "top-start",
    showClass: {
      popup: "animate__animated animate__slideInRight animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__slideOutRight animate__faster",
    },
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  ToastAlert.fire({
    icon: "success",
    title: Text,
  });
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
          <button class="btn btn-sm btn-secondary qr-btn" data-id="${card.id}">
           <i class="fa-solid fa-qrcode"></i>
          </button>
        </div>
      </div>
    `;
    const deleteBtn = link.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      SwalFire("Seçili linki silmek istediğinize eminmisiniz?").then(
        (result) => {
          if (result.isConfirmed) {
            deleteLink(card.id);
          }
        },
      );
    });

    const qrBtn = link.querySelector(".qr-btn");
    qrBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = qrBtn.dataset.id;
      const card = LinksCards.find((x) => x.id === id);
      if (!card) return;
      qrContainer.innerHTML = "";
      new QRCode(qrContainer, {
        text: card.url,
        width: 200,
        height: 200,
        colorDark: "#000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H,
      });
      ShowModal(qrcodemodal);
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

function HideModal(ElementName) {
  bootstrap.Modal.getOrCreateInstance(ElementName).hide();
}

function ShowModal(ElementName) {
  bootstrap.Modal.getOrCreateInstance(ElementName).show();
}

function LinkIcon(url) {
  if (url.toLowerCase().includes("youtube")) {
    return "fa-brands fa-youtube fa-lg text-danger";
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
    return "fa-brands fa-google fa-lg text-warning";
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

function SwalFire(Text) {
  return Swal.fire({
    theme: mode,
    position: "top",
    title: "Uyarı",
    text: Text,
    icon: "warning",
    allowOutsideClick: false, // todo  out click
    allowEscapeKey: false, // todo esc click
    showClass: {
      popup: "animate__animated animate__zoomIn animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__zoomOut animate__faster",
    },
    showCancelButton: true,
    confirmButtonText: "Evet",
    cancelButtonText: "Vazgeç",
  });
}

function ControlScroll() {
  if (window.scrollY > 300) {
    topscrool.classList.remove("d-none");
  } else {
    topscrool.classList.add("d-none");
  }
}
