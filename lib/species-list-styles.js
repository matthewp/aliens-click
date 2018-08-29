module.exports = `
.alien-search {
  background: var(--alt-bg-color, #0B0014);
  color: var(--fg-color, #F5E9E2);
  border: none;
  line-height: 1.5em;
  padding: .5em;
  outline: none;
  font-size: 1.2em;
  width: 100%;
}

.species {
  list-style-type: none;
  padding: 0;
}

.species figure {
  display: flex;
  justify-content: center;
  margin: 0;
  max-height: 200px;
}

.specie figure img {
  border-radius: 5px;
}

@media only screen and (max-device-width: 767px) {
  .specie figure img {
    width: 150px;
    height: 150px;
  }
}

h1, h2, h3 {
  color: var(--header-color);
}

.specie {
  position: relative;
  display: inline-flex;
  margin: 10px;
}

.specie-title {
  position: absolute;
  background: rgba(0,0,0,.5);
  color: var(--alt-link-color, white);
  padding: 3px;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
}
`;