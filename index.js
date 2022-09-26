const BASE_URL = "https://lighthouse-user-api.herokuapp.com/api/v1/users"
const users = []
let filteredUsers = []
let currentPage = 1

const divider = 16

const userList = document.querySelector("#user-list")
const search = document.querySelector('#search-bar')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator-bar')

// 獲取資料，將所有資料寫進首頁
axios
  .get(BASE_URL)
  .then((response) => {
    users.push(...response.data.results)
    calculatePages(users)
    renderUser(getUserByPage(users, 1))
  })
  .catch((err) => {
    console.log(err)
  })

function renderUser(allUser) {
  let renderHTML = ""

  allUser.forEach(function render(user) {
    renderHTML += `
      <div class="card m-1 text-center" style="width: 12rem">
        <img src="${user.avatar}" class="card-img-top" alt="user-avatar">
        <div class="card-body row">
          <h6 class="card-title">${user.name} ${user.surname}</h6>
        </div>
        <div class="card-footer">
          <a href="#" class="btn btn-outline-info btn-more" data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${user.id}">More</a>
          <a href="#" class="btn btn-outline-success btn-add" data-id="${user.id}">Add</a>
        </div>
      </div>
    `
  })

  userList.innerHTML = renderHTML
}

// 我的最愛功能
function addFavorite(number) {
  const favUserList = JSON.parse(localStorage.favUserList) || []
  
  if (favUserList.some(user => user.id === number)) {
    return alert('already added')
  }

  const user = users.find(user => user.id === number)
  favUserList.push(user)
  alert('add successfully')
  localStorage.favUserList = JSON.stringify(favUserList)
}

// 分頁功能
function calculatePages(data) {
  const pageNumber = Math.ceil(data.length / divider)
  let rawHTML = ''

  for (let i = 1; i <= pageNumber; i++) {
    if (i === 1) {
      rawHTML += `<li class="page-item active"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
    } else {
      rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
    }
  }

  paginator.innerHTML = rawHTML
}

function getUserByPage(data, page) {
  const startIndex = divider * (page - 1)
  return data.slice(startIndex, startIndex + divider)
}

function pageActive(page) {
  const children = paginator.children
  
  if (currentPage === page) return
  
  children[currentPage - 1].classList.remove('active')
  currentPage = page
  children[page - 1].classList.add('active')
}

paginator.addEventListener('click', (e) => {
  const target = e.target
  const dataSource = filteredUsers.length? filteredUsers : users

  if (e.target.tagName !== 'A') return
  renderUser(getUserByPage(dataSource, Number(target.dataset.page)))
  pageActive(Number(target.dataset.page))
})

// 搜尋功能
search.addEventListener('submit', (e) => {
  e.preventDefault()
  const findUserName = searchInput.value.trim().toLowerCase()

  filteredUsers = users.filter(user => user.name.toLowerCase().includes(findUserName) || user.surname.toLowerCase().includes(findUserName))
  if (filteredUsers.length === 0) {
    return alert('There is no match with ' + findUserName)
  }
  calculatePages(filteredUsers)
  renderUser(getUserByPage(filteredUsers, 1))
})

// 點擊按鈕出現彈出視窗，顯示詳細資料
userList.addEventListener("click", (e) => {
  const target = e.target

  if (!(target.dataset.id)) { return }

  if (target.classList.contains('btn-more')) {
    showUserModal(Number(target.dataset.id))
  }

  if (target.classList.contains('btn-add')) {
    addFavorite(Number(target.dataset.id))
  }
  
})

// 改寫modal的資料
function showUserModal(id) {
  const name = document.querySelector("#user-modal-name")
  const image = document.querySelector("#user-modal-image")
  const userModalInfo = document.querySelector("#user-modal-info")

  name.innerText = ''
  image.innerHTML = ''
  userModalInfo.innerHTML = ''
  
  axios
    .get(BASE_URL + "/" + id)
    .then((response) => {
      const data = response.data
      
      name.innerText = `${data.name} ${data.surname}`
      image.innerHTML = `<img src="${data.avatar}" alt="user-image">`
      userModalInfo.innerHTML = `
        <p id="user-modal-email">Email: ${data.email}</p>
        <p id="user-modal-gender">Gender: ${data.gender}</p>
        <p id="user-modal-age">Age: ${data.age}</p>
        <p id="user-modal-region">Region: ${data.region}</p>
        <p id="user-modal-birthday">Birthday: ${data.birthday}</p>
      `
    })
    .catch((err) => { console.log(err) })
}
