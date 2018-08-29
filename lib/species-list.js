
module.exports = function({
  styles = '',
  filter = '',
  species = []
}){
  return `
    <div>
      <style>${styles}</style>
      <h1>Aliens</h1>

      <form action="/search">
        <input type="text" value="${filter}" name="q"
          placeholder="Search species"class="alien-search" />
      </form>
      <ul class="species">
        ${species.map(specie => (`
        <li class="specie">
          <a href="/article/${specie.id}">
            <figure>
              ${specie.tn ? `
                <img src="${specie.tn}" />
              `: ''}
            </figure>
            <span class="specie-title">${specie.title}</span>
          </a>
        </li>
        `)).join('')}
      </ul>
    </div>
  `;
};
