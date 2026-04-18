<!--
    This is the preview page of flext2pdf.

    It is intended for internal use, so
    if you see this, it may indicate an
    internal error or malfunction.
-->

<template id="template"><!--TEMPLATE--></template>
<script type="application/json" id="data">{"DATA":""}</script>

<main id="flext"><!--HTML--></main>

<script type="module">
import Flext from 'http://flext2pdf/flext.js';


// Functions

async function preview() {

    // Getting the data

    const template = document.getElementById('template').content.textContent || '';

    const data = JSON.parse(document.getElementById('data').textContent ?? null);

    const el = document.getElementById('flext');


    // Getting the HTML

    const flext = new Flext().setTemplate(template).setData(data);

    el.innerHTML = flext.html;


    // Getting the CSS

    const styleEl = document.createElement('style');

    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = await flext.getCss();

    document.head.appendChild(styleEl);


    // Waiting for the fonts

    await document.fonts.ready;


    // Waiting for the images

    const images = [ ...document.images ].filter(i => !i.complete);

    await Promise.all(images.map(i => new Promise(resolve => {
        i.addEventListener('load', resolve, { once: true });
        i.addEventListener('error', resolve, { once: true });
    })));


    // Waiting for the render

    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
}


// Getting the preview

window.addEventListener('load', function () {
    preview().then(window.__finish).catch(window.__error);
}, { once: true });
</script>