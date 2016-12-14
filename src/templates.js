import { h } from 'fritz';
import Layout from './Layout.js';
import Loading from './Loading.js';
import SpeciesList from './SpeciesList.js';

function index(species, state) {
  return (
    <Layout state={state}>
      <SpeciesList species={species}></SpeciesList>
    </Layout>
  );
}

function search(species, query, state) {
  return (
    <Layout state={state}>
      <SpeciesList species={species} filter={query}></SpeciesList>
    </Layout>
  );
}

function articleSection(section, idx) {
  return (
    <section>
      {idx === 0 ? '' : <h2>{section.title}</h2>}

      <div>
        {section.content.map(content => {
          return <p>{content.text}</p>
        })}
      </div>
    </section>
  );
}

function article(articleData, state) {
  let data = articleData;
  let intro = data.article.sections[0];

  return (
    <Layout state={state}>
      <h1>{intro.title}</h1>

      <article>
        {data.article.sections.map(articleSection)}
      </article>
    </Layout>
  );
}

export {
  Layout,
  Loading,
  SpeciesList,
  index,
  search,
  article
}
