<main id="flext"></main>

<script type="module">
import Flext from 'http://flext2pdf/flext.js';


// Constants

const TEMPLATE = "{TEMPLATE}";

const DATA = {DATA};


// Functions

async function setup() {

    // Getting the Flext

    const flext = new Flext().setTemplate(TEMPLATE).setData(DATA);


    // Getting the HTML

    const el = document.getElementById('flext');

    el.innerHTML = flext.html;


    // Getting the CSS

    const styleEl = document.createElement('style');

    styleEl.setAttribute('type', 'text/css');
    styleEl.textContent = await flext.getCss();

    document.body.appendChild(styleEl);


    window.__finish();
}


setup().catch(window.__error);
</script>