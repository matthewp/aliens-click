
/*

return (
  <div>
    <style>{styles}</style>
    <h1>Aliens</h1>

    <form action="/search">
      <input onKeyup={keyup} type="text" value={ filter ? filter : '' }
        name="q" placeholder="Search species" class="alien-search" />
    </form>
    <ul class="species">
      {items.map(specie => {
        return <Specie specie={specie}/>
      })}
    </ul>
  </div>
);

*/
