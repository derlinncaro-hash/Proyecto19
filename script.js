const URL = "https://jsonplaceholder.typicode.com/users/";

const contenedor = document.getElementById("carriles");
const btnAgregar = document.getElementById("btn-agregar");
const ventana = document.getElementById("ventana");
const entrada = document.getElementById("entrada");
const errorVentana = document.getElementById("error-ventana");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnCancelar = document.getElementById("btn-cancelar");

// Lista de carriles guardados 
let carriles = JSON.parse(localStorage.getItem("carriles")) || [];

function guardar() {
    localStorage.setItem("carriles", JSON.stringify(carriles));
}

// Pide los datos del usuario a la API
async function traerUsuario(id) {
    let respuesta;

    try {
        respuesta = await fetch(URL + id);
    } catch (error) {
        throw new Error("No hay conexión con la API");
    }

    // Si el usuario no existe la API responde con error 404
    if (respuesta.status === 404) {
        throw new Error("El usuario " + id + " no existe");
    }
    if (!respuesta.ok) {
        throw new Error("Error al consultar la API");
    }

    return await respuesta.json();
}

// Carga los datos del usuario dentro de un carril
async function cargarCarril(id, lista) {
    lista.innerHTML = '<p class="mensaje">Cargando...</p>';

    try {
        const usuario = await traerUsuario(id);

        const datos = [
            ["Nombre", usuario.name],
            ["Usuario", usuario.username],
            ["Correo", usuario.email],
            ["Teléfono", usuario.phone],
            ["Sitio web", usuario.website],
            ["Empresa", usuario.company.name],
            ["Ciudad", usuario.address.city]
        ];

        lista.innerHTML = "";
        datos.forEach(function (dato) {
            lista.innerHTML +=
                '<div class="post">' +
                "<div>" +
                '<div class="titulo">' + dato[1] + "</div>" +
                '<div class="autor">' + dato[0] + "</div>" +
                "</div>" +
                "</div>";
        });
    } catch (error) {
        lista.innerHTML = '<p class="mensaje error">' + error.message + "</p>";
    }
}

// Dibuja un carril en la pantalla
function crearCarril(id) {
    const carril = document.createElement("div");
    carril.className = "carril";
    carril.innerHTML =
        '<div class="encabezado">' +
        "<span>/users/" + id + "</span>" +
        '<button class="btn-menu">⋮</button>' +
        '<div class="menu oculto">' +
        '<button class="btn-refrescar">Refrescar</button>' +
        '<button class="btn-eliminar">Eliminar</button>' +
        "</div>" +
        "</div>" +
        '<div class="lista"></div>';

    contenedor.appendChild(carril);

    const lista = carril.querySelector(".lista");
    const menu = carril.querySelector(".menu");

    // Abrir y cerrar el menu
    carril.querySelector(".btn-menu").addEventListener("click", function () {
        menu.classList.toggle("oculto");
    });

    // vuelve a pedir los datos
    carril.querySelector(".btn-refrescar").addEventListener("click", function () {
        menu.classList.add("oculto");
        cargarCarril(id, lista);
    });

    //  quita el carril y lo borra 
    carril.querySelector(".btn-eliminar").addEventListener("click", function () {
        carriles = carriles.filter(function (n) {
            return n !== id;
        });
        guardar();
        carril.remove();
    });

    cargarCarril(id, lista);
}

// Ventana para agregar un carril
btnAgregar.addEventListener("click", function () {
    entrada.value = "";
    errorVentana.textContent = "";
    ventana.classList.remove("oculto");
});

btnCancelar.addEventListener("click", function () {
    ventana.classList.add("oculto");
});

btnConfirmar.addEventListener("click", async function () {
    const id = entrada.value.trim();

    if (id === "" || isNaN(id)) {
        errorVentana.textContent = "Escribe un número, por ejemplo 1";
        return;
    }

    if (carriles.includes(id)) {
        errorVentana.textContent = "Ese carril ya existe";
        return;
    }

    // verifico que el usuario exista
    errorVentana.textContent = "Verificando...";
    try {
        await traerUsuario(id);
        carriles.push(id);
        guardar();
        crearCarril(id);
        ventana.classList.add("oculto");
    } catch (error) {
        errorVentana.textContent = error.message;
    }
});

// Al abrir la página se restauran los carriles guardados
carriles.forEach(function (id) {
    crearCarril(id);
});