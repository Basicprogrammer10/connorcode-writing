(async () => {
  const RARITY = {
    UNCOMMON: "#FF5",
    RARE: "#5FF",
    VERY_RARE: "#F5F",
    COMMON: "inherit",
  };

  document.querySelector("[loading]").remove();
  let enchants = await (
    await fetch("../assets/minecraft/minecraft-enchantments-list/data.json")
  ).json();
  enchants.sort((a, b) => a.name.localeCompare(b.name));

  const list = document.querySelector("[list]");
  const done = document.createElement("div");
  done.style.marginBottom = "1rem";
  list.appendChild(done);

  for (let i of enchants) {
    let element = document.createElement("div");

    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) element.style.textDecoration = "line-through";
      else element.style.textDecoration = "none";
      updateComplete();
    });
    element.appendChild(checkbox);

    let text = document.createElement("span");
    text.addEventListener("click", () => {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) element.style.textDecoration = "line-through";
      else element.style.textDecoration = "none";
      updateComplete();
    });
    text.innerText = `${i.name} ${romanize(i.max_level)}`;
    text.style.color = RARITY[i.rarity];
    text.classList.add("enchantment");
    element.appendChild(text);

    element.style.marginBottom = "0.25rem";
    list.appendChild(element);
  }
  loadProgress();
  updateComplete();

  const clear = document.querySelector("[clear]");
  clear.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear the list?")) {
      for (let i = 1; i < list.children.length; i++) {
        list.children[i].children[0].checked = false;
        list.children[i].style.textDecoration = "none";
      }
      updateComplete();
    }
  });

  function loadProgress() {
    let storage = JSON.parse(
      localStorage.getItem("minecraft-enchantments-list")
    );
    if (!storage) return;
    for (let i = 1; i < list.children.length; i++) {
      let original = enchants[i - 1];
      if (storage[original.name]) {
        list.children[i].children[0].checked = true;
        list.children[i].style.textDecoration = "line-through";
      }
    }
  }

  function updateComplete() {
    let complete = 0;
    for (let i = 1; i < list.children.length; i++)
      if (list.children[i].children[0].checked) complete++;
    done.innerText = `Completed: ${complete}/${list.children.length}`;

    let storage = {};
    for (let i = 1; i < list.children.length; i++) {
      let original = enchants[i - 1];
      storage[original.name] = list.children[i].children[0].checked;
    }
    localStorage.setItem(
      "minecraft-enchantments-list",
      JSON.stringify(storage)
    );
  }

  function romanize(num) {
    const lookup = { V: 5, IV: 4, I: 1 };
    let out = "";
    let i = 0;

    for (i in lookup) {
      while (num >= lookup[i]) {
        out += i;
        num -= lookup[i];
      }
    }

    return out;
  }
})();
