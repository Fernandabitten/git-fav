import { GithubUser } from "./GithubUser.js";

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root);
    this.load();
  }
  load() {
    this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || [];
  }
  save() {
    localStorage.setItem("@github-favorites:", JSON.stringify(this.entries));
  }
  async add(username) {
    try {
      const userExists = this.entries.find((entry) => entry.login === username);
      if (userExists) {
        throw new Error("usuário já cadastrado");
      }
      const user = await GithubUser.search(username);

      if (user.login === undefined) {
        throw new Error("Usuário não encontrado!");
      }
      history.go(0);
      this.entries = [user, ...this.entries];
      this.update();
      this.save();
    } catch (error) {
      alert(error.message);
    }
  }
  delete(user) {
    const filteredEntries = this.entries.filter(
      (entry) => entry.login !== user.login
    );
    this.entries = filteredEntries;
    this.update();
    this.save();
  }
}
export class FavoritesView extends Favorites {
  constructor(root) {
    super(root);
    this.tbody = this.root.querySelector("table tbody");
    this.update();
    this.onadd();
  }
  onadd() {
    const addButton = this.root.querySelector(".search button");
    const inputElement = this.root.querySelector(".search input");
  
    // Adicionar event listener para o evento "keypress" no input
    inputElement.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        const { value } = inputElement;
        this.add(value);
        document.getElementById("favorite").value = "";
      }
    });
  
    // Adicionar event listener para o clique no botão
    addButton.onclick = () => {
      const { value } = inputElement;
      this.add(value);
      document.getElementById("favorite").value = "";
    };
  }
  update() {
    this.removeAllTr();
    this.entries.forEach((user) => {
      const row = this.createRow();
      row.querySelector(
        ".user img"
      ).src = `https://github.com/${user.login}.png`;
      row.querySelector(".user p").textContent = user.name;
      row.querySelector(".user span").textContent = user.login;
      row.querySelector(".user img").alt = `Imagem de ${user.name}`;
      row.querySelector(".user a").href = `https://github.com/${user.login}`;
      row.querySelector(".repositories").textContent = user.public_repos;
      row.querySelector(".followers").textContent = user.followers;
      row.querySelector(".remove").onclick = () => {
        const isOk = confirm("Tem certeza que deseja deletar essa linha?");
        if (isOk) {
          this.delete(user);
        }
      };
      this.tbody.append(row);
    });
    const noFavorite = this.noFavoriteImg() || "";
    this.tbody.append(noFavorite);
  }
  createRow() {
    const tr = document.createElement("tr");
    tr.innerHTML = `    
      <td class="user" style="width:504px;">
        <img src="https://github.com/Fernandabitten.png" alt="Imagem de Fernanda">
        <a class="user-link" href="https://github.com/Fernandabitten" target="_blank">
          <p>Fernanda Bittencourt</p>
          <span>Fernandabitten</span>
        </a>
      </td>
      <td class="repositories hiden" style="width:310px;  text-align: end;">      
        123
      </td>
      <td class="followers hiden" style="width:219px;  text-align: end;">
        1234
      </td>
      <td>
        <button class="remove" style="width:178px;  text-align: end;">
          <img src="./img/trash.png" alt="figura de uma lixeira"> 
          <span id="trash">Remover</span>         
        </button>
      </td>  
      `;
    return tr;
  }

  noFavoriteImg() {
    if (Object.keys(this.entries).length === 0) {
      const noFav = document.createElement("div");
      noFav.innerHTML = `    
      <div id="hiden">
        <img src="./img/Estrela.png" alt="Figura de uma estrela">
        <h1>Nenhum favorito ainda</h1>
      </div>  `;
      return noFav;
    }
  }

  removeAllTr() {
    this.tbody.querySelectorAll("tr").forEach((tr) => {
      tr.remove();
    });
  }
}
