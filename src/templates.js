import { h } from 'fritz';
import Layout from './Layout.js';
import Loading from './Loading.js';
import SpeciesList from './SpeciesList.js';
import SpeciesArticle from './SpeciesArticle.js';

function index(species, state) {
  return (
    <Layout state={state}>
      <SpeciesList species={species}></SpeciesList>
    </Layout>
  );
}

function selection(species, idx) {
  return (
    <Layout>
      <SpeciesList species={species} selected={idx}></SpeciesList>
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
  return (
    <Layout state={state}>
      <SpeciesArticle data={articleData} />
    </Layout>
  );
}

export {
  Layout,
  Loading,
  SpeciesList,
  index,
  search,
  article,
  selection
}
