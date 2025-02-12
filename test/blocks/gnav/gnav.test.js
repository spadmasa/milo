import { readFile, resetMouse, setViewport, sendKeys, sendMouse } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import sinon, { stub } from 'sinon';
import { delay } from '../../helpers/waitfor.js';
import { setConfig } from '../../../libs/utils/utils.js';

window.lana = { log: stub() };

document.head.innerHTML = await readFile({ path: './mocks/head.html' });
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

const mod = await import('../../../libs/blocks/gnav/gnav.js');
let gnav;

const config = { locales: { '': { ietf: 'en-US', tk: 'hah7vzn.css' } } };
setConfig(config);

describe('Gnav', () => {
  beforeEach(() => {
    sinon.spy(console, 'log');
  });

  afterEach(() => {
    console.log.restore();
  });

  it('test wrong gnav', async () => {
    gnav = await mod.default(document.querySelector('header'));
    expect(gnav).to.be.not.null;
  });

  it('builds breadcrumbs nav element', async () => {
    expect(document.querySelector('header nav.breadcrumbs')).to.exist;
  });

  it('nav menu toggle test', async () => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav.gnav');
    const gnavBtn = nav.querySelector('button');
    const largeMenu = document.querySelector('.gnav-navitem.section-menu');
    const largeMenuBtn = largeMenu.querySelector(':scope > a');

    // for mobile
    await setViewport({ width: 400, height: 640 });
    gnavBtn.click();
    expect(header.classList.contains(mod.IS_OPEN)).to.be.true;
    gnavBtn.click();
    expect(header.classList.contains(mod.IS_OPEN)).to.be.false;
    gnavBtn.click();
    await setViewport({ width: 1250, height: 640 });

    // for desktop
    largeMenuBtn.click();
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.true;
    largeMenuBtn.click();
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.false;
  });

  it('nav menu close on scroll', async () => {
    const largeMenu = document.querySelector('.gnav-navitem.section-menu');
    const largeMenuBtn = largeMenu.querySelector(':scope > a');
    await setViewport({ width: 1250, height: 640 });

    largeMenuBtn.click();
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.true;
    window.scrollTo(0, 400);
    await delay(100);
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.false;
  });

  it('nav menu toggle test - 1', async () => {
    const largeMenuBtn = document.querySelector('.gnav-navitem.section-menu > a');
    const largeMenu = document.querySelector('.gnav-navitem.section-menu');
    largeMenuBtn.focus();
    await delay(100);
    await sendKeys({ press: 'Space' });
    await delay(100);
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.true;
  });

  it('nav menu toggle test - 2', async () => {
    const largeMenuBtn = document.querySelector('.gnav-navitem.section-menu > a');
    largeMenuBtn.blur();
    await sendKeys({ press: 'Escape' });
    const largeMenu = document.querySelector('.gnav-navitem.section-menu');
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.false;
    largeMenuBtn.click();
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.true;
    await sendMouse({
      type: 'click',
      position: [700, 1000],
      button: 'left',
    });
    await delay(50);
    expect(largeMenu.classList.contains(mod.IS_OPEN)).to.be.false;
    await resetMouse();
  });

  it('renders breadcrumbs LD+JSON in the head for SEO)', async () => {
    const script = document.querySelector('script[type="application/ld+json"]');
    const actual = JSON.parse(script.innerHTML);
    const expected = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [{
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'http://localhost:2000/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Drafts',
        item: 'http://localhost:2000/',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Marquee',
      }],
    };
    expect(actual).to.deep.equal(expected);
  });

  it('does NOT render breadcrumbs LD+JSON in the head for SEO)', async () => {
    document.head.innerHTML = await readFile({ path: './mocks/head-breadcrumb-seo-disabled.html' });
    const script = document.querySelector('script[type="application/ld+json"]');
    expect(script).to.be.null;
    // reset <head>
    document.head.innerHTML = await readFile({ path: './mocks/head.html' });
  });
});
