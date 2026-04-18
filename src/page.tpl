<!--
    This is the preview page of flext2pdf.

    It is intended for internal use, so
    if you see this, it may indicate an
    internal error or malfunction.
-->

<main id="flext"><!--HTML--></main>

<script type="module">
import Flext from 'http://flext2pdf/flext.js';


// Constants

const TEMPLATE = "{TEMPLATE}";

const DATA = {/*DATA*/};


// Functions

async function preview() {

    // Getting the Flext

    const flext = new Flext().setTemplate(TEMPLATE).setData(DATA);


    // Getting the HTML

    const el = document.getElementById('flext');

    el.innerHTML = flext.html;


    // Getting the CSS

    const styleEl = document.createElement('style');

    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = await flext.getCss();

    document.head.appendChild(styleEl);
}


// Getting the preview

window.addEventListener('load', function () {
    preview().then(window.__finish).catch(window.__error);
});
</script>