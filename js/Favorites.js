export class GitHubUser {
  static search(username) {
    const endpoint = `https://api.github.com/users/${username}`

    return fetch(endpoint)
      .then(data => data.json())
      .then(data => ({
        login: data.login,
        name: data.name,
        public_repos: data.public_repos,
        followers: data.followers
      }))
  }
}

//classe que vai conter a lógica dos dados
// como os dados serão estruturados

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    const entries = JSON.parse(localStorage.getItem('@github:')) || []

    this.entries = entries
  }

  save() {
    localStorage.setItem('@github:', JSON.stringify(this.entries))
  }

  delete(user) {
    const filteredEntries = this.entries.filter(
      entry => entry.login !== user.login
    )

    this.entries = filteredEntries
    this.update()
    this.save()
  }

  async add(value) {
    try {
      const userExist = this.entries.find(entry => entry.login === value)
      if (userExist) {
        throw new Error('Usuario já criado!')
      }

      const user = await GitHubUser.search(value)

      if (user.login === undefined) {
        throw new Error('Usuario nao encontrado!')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }
}

// classe que vai criar a visualização do HTML e os eventos 'clicks' etc

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)
    this.tbody = this.root.querySelector('table tbody')
    this.update()
    this.onadd()
  }

  onadd() {
    const addButton = this.root.querySelector('.button')

    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }
  createRow() {
    const tr = document.createElement('tr')
    const content = `
            <td class="user">
              <img
                src="https://github.com/MauricioGomarim.png"
                alt="Perfil Mauricio"
              />
              <a href="https://github.com/MauricioGomarim">
                <p>Mauricio Gomarim</p>
                <span>MauricioGomarim</span>
              </a>
            </td>
            <td class="repositories">123</td>
            <td class="followers">123</td>
            <td class="remove"><span>Remover</span></td>
    `
    tr.innerHTML = content

    return tr
  }

  update() {
    this.removeAllTr()

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`

      row.querySelector('.user p').textContent = user.name
      row.querySelector('.user span').textContent = user.login
      row.querySelector('.repositories').textContent = user.public_repos
      row.querySelector('.followers').textContent = user.followers

      row.querySelector('.remove').onclick = () => {
        this.delete(user)
      }

      this.tbody.append(row)
    })
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
