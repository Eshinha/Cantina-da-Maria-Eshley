document.addEventListener('deviceready', () => {
    initializeApp();
}, false);

let pizzaEditIndex = null;
let pizzasList = [];
const PIZZARIA_ID = "cantina-maria-eshley";

let appList, appForm, btnNew, btnCancel, btnSave, btnDelete, btnPhoto, pizzaImage;

function initializeApp() {
    appList = document.getElementById('applista');
    appForm = document.getElementById('appcadastro');
    btnNew = document.getElementById('btnNovoF'); // Corrigido para corresponder ao id do HTML
    btnCancel = document.getElementById('btnCancelar');
    btnSave = document.getElementById('btnSalvar');
    btnDelete = document.getElementById('btnExcluir');
    btnPhoto = document.getElementById('btnFoto');
    pizzaImage = document.getElementById('imagem');

    cordova.plugin.http.setDataSerializer('json');

    btnNew.addEventListener('click', showNewPizzaForm);
    btnCancel.addEventListener('click', hideForm);
    btnSave.addEventListener('click', savePizza);
    btnDelete.addEventListener('click', deletePizza);
    btnPhoto.addEventListener('click', capturePhoto);

    loadPizzas();
}

function showNewPizzaForm() {
    document.getElementById('pizza').value = "";
    document.getElementById('preco').value = "";
    pizzaImage.style.backgroundImage = "none";
    pizzaEditIndex = null;
    appList.style.display = 'none';
    appForm.style.display = 'flex';
}

function hideForm() {
    appList.style.display = 'flex';
    appForm.style.display = 'none';
}

function savePizza() {
    const pizzaInput = document.getElementById('pizza');
    const priceInput = document.getElementById('preco');
    const pizzaName = pizzaInput.value.trim();
    const pizzaPrice = priceInput.value.trim();

    let bgImage = pizzaImage.style.backgroundImage;
    let imageData = "";
    if (bgImage.includes('data:image/jpeg;base64,')) {
        imageData = bgImage.replace('url("data:image/jpeg;base64,', '').replace('")', '');
    }

    if (pizzaName === "" || pizzaPrice === "" || imageData === "") {
        alert("Por favor, preencha todos os campos e capture uma foto!");
        return;
    }

    const dataPayload = {
        pizzaria: PIZZARIA_ID,
        pizza: pizzaName,
        preco: parseFloat(pizzaPrice),
        imagem: imageData
    };

    const url = "https://pedidos-pizzaria.glitch.me/admin/pizza/";
    const method = (pizzaEditIndex === null) ? 'post' : 'put';

    if (method === 'put') {
        dataPayload.pizzaid = pizzasList[pizzaEditIndex]._id;
    }

    cordova.plugin.http[method](url, dataPayload, { "Content-Type": "application/json" },
        function(response) {
            alert("Pizza salva com sucesso!");
            loadPizzas();
            appList.style.display = 'flex';
            appForm.style.display = 'none';
        },
        function(error) {
            console.error("Erro ao salvar pizza:", error);
            alert("Erro ao salvar pizza. Tente novamente.");
        }
    );
}

function deletePizza() {
    if (pizzaEditIndex === null) {
        alert("Nenhuma pizza selecionada para excluir!");
        return;
    }

    const pizzaName = pizzasList[pizzaEditIndex].pizza;
    const url = "https://pedidos-pizzaria.glitch.me/admin/pizza/" + PIZZARIA_ID + "/" + encodeURIComponent(pizzaName);

    cordova.plugin.http.delete(url, {}, {},
        function(response) {
            alert("Pizza excluída com sucesso!");
            loadPizzas();
            appList.style.display = 'flex';
            appForm.style.display = 'none';
            pizzaEditIndex = null;
            pizzaImage.style.backgroundImage = "none";
        },
        function(error) {
            console.error("Erro ao excluir pizza:", error);
            alert("Erro ao excluir pizza.");
        }
    );
}

function capturePhoto() {
    navigator.camera.getPicture(
        handlePhotoSuccess,
        handlePhotoError,
        {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL
        }
    );
}

function handlePhotoSuccess(imageData) {
    pizzaImage.style.backgroundImage = "url('data:image/jpeg;base64," + imageData + "')";
}

function handlePhotoError(message) {
    alert("Falha ao capturar a foto: " + message);
}

function loadPizzas() {
    const pizzaListContainer = document.getElementById('listaPizzas');
    pizzaListContainer.innerHTML = "";

    const url = "https://pedidos-pizzaria.glitch.me/admin/pizzas/" + PIZZARIA_ID;
    cordova.plugin.http.get(url, {}, {},
        function(response) {
            if (response.data !== "") {
                pizzasList = JSON.parse(response.data);
                pizzasList.forEach((pizzaItem, index) => {
                    const pizzaDiv = document.createElement('div');
                    pizzaDiv.classList.add('linha');
                    pizzaDiv.innerHTML = `${pizzaItem.pizza} - R$ ${parseFloat(pizzaItem.preco).toFixed(2)}`;
                    pizzaDiv.id = index;
                    pizzaDiv.addEventListener('click', () => {
                        loadPizzaDetails(index);
                    });
                    pizzaListContainer.appendChild(pizzaDiv);
                });
            }
        },
        function(error) {
            console.error("Erro ao carregar pizzas:", error);
            alert("Erro ao carregar pizzas. Verifique sua conexão com a internet.");
        }
    );
}

function loadPizzaDetails(index) {
    const pizzaData = pizzasList[index];
    if (pizzaData) {
        document.getElementById('pizza').value = pizzaData.pizza;
        document.getElementById('preco').value = pizzaData.preco;
        if (pizzaData.imagem) {
            pizzaImage.style.backgroundImage = "url('data:image/jpeg;base64," + pizzaData.imagem + "')";
        } else {
            pizzaImage.style.backgroundImage = "none";
        }
        pizzaEditIndex = index;
        appList.style.display = 'none';
        appForm.style.display = 'flex';
    }
}
