document.addEventListener("onload", () => {
  const codeBlocks = document.querySelectorAll("pre code.language-rust");
  codeBlocks.forEach((block) => {
    const button = document.createElement("button");
    button.innerHTML = "RUN";
    button.classList.add("btn", "btn-primary", "btn-sm", "float-right");
    block.parentNode.insertBefore(button, block.nextSibling);
  });
});
