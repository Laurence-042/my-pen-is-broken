[...document.querySelectorAll("body *:not(script):not(style)")].filter(item => !item.children.length && item.innerText).forEach(el => {
    el.addEventListener('click', e => {
        let position = window.getSelection();
        console.log(position);
    });
});