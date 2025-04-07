/******************************************************************
 *		ATTRIBUTES DEFINITION (ENGLISH)                      *
 ******************************************************************/
 const attributes = {
	"Product Attributes": ["Required Reliability", "Database Size", "Product Complexity"],
	"Computer Attributes": ["Execution Time Constrain", "Main Storage Constrain", "Platform Volatility", "Computer Turnaround Time"],
	"Personnel Attributes": ["Analyst Capability", "Applications Experience", "Programmer Capability", "Platform Experience", "Programming Language and Tool Experience"],
	"Project Attributes": ["Modern Programming Practices", "Use of Software Tools", "Required Development Schedule"],
	"Additional Attributes": ["Required Reusability", "Documentation Match to Life-Cycle Needs", "Personnel Continuity", "Multisite Development"]
};

/******************************************************************
 *		ATTRIBUTES DEFINITION (SPANISH)                      *
 ******************************************************************/
const attributesEs = {
	"Atributos del Producto": ["Confiabilidad Requerida", "Tamaño de la Base de Datos", "Complejidad del Producto"],
	"Atributos de la Computadora": ["Restricción de Tiempo de Ejecución", "Restricción de Almacenamiento Principal", "Volatilidad de la Plataforma", "Tiempo de Respuesta de la Computadora"],
	"Atributos del Personal": ["Capacidad del Analista", "Experiencia en Aplicaciones", "Capacidad del Programador", "Experiencia en la Plataforma", "Experiencia en Lenguajes y Herramientas de Programación"],
	"Atributos del Proyecto": ["Prácticas Modernas de Programación", "Uso de Herramientas de Software", "Cronograma de Desarrollo Requerido"],
	"Atributos Adicionales": ["Reusabilidad Requerida", "Documentación Adaptada al Ciclo de Vida", "Continuidad del Personal", "Desarrollo Multisitio"]
};

/******************************************************************
 *		LEVELS DEFINITION (EN & ES)                          *
 ******************************************************************/
const levels    = ["VL", "L", "N", "H", "VH", "XH"];
const levelsEs  = ["MB", "B", "N", "A", "MA", "EA"];  // Muy Bajo, Bajo, Nominal, Alto, Muy Alto, Extra Alto

/******************************************************************
 *		COCOMO COEFFICIENTS FOR PROJECT MODES                  *
 ******************************************************************/
const cocomoCoefficients = {
	organic: { a: 2.4, b: 1.05, c: 2.5, d: 0.38 },
	"semi-detached": { a: 3.0, b: 1.12, c: 2.5, d: 0.35 },
	embedded: { a: 3.6, b: 1.20, c: 2.5, d: 0.32 }
};

/******************************************************************
 *		GLOBAL VARIABLES                                      *
 ******************************************************************/
let isSpanish         = false;   // Indica si el idioma actual es español
let lastCocomoResult  = null;    // Almacena el último resultado calculado de COCOMO

/******************************************************************
 *		CREATE ATTRIBUTE SECTION DYNAMICALLY                 *
 ******************************************************************/
function createAttributeSection(containerId, attributes) {
	const container = document.getElementById(containerId);
	container.innerHTML = ""; // Limpia el contenido existente

	for (const [section, items] of Object.entries(attributes)) {
		const sectionDiv = document.createElement('div');
		sectionDiv.className = section.replace(/\s+/g, '_');

		const sectionTitle = document.createElement('h3');
		sectionTitle.textContent = section;
		sectionDiv.appendChild(sectionTitle);

		items.forEach(item => {
			const itemParagraph = document.createElement('p');
			itemParagraph.textContent = item;
			sectionDiv.appendChild(itemParagraph);

			const currentLevels = isSpanish ? levelsEs : levels;
			currentLevels.forEach(level => {
				const label = document.createElement('label');
				const input = document.createElement('input');
				input.type = 'radio';
				input.name = item.toLowerCase().replace(/\s+/g, '-');
				input.value = level;
				if (level === "N" || level === "Nominal") {
					input.checked = true; // Marca "N" como la opción predeterminada
				}
				label.appendChild(input);
				label.appendChild(document.createTextNode(level));
				sectionDiv.appendChild(label);
			});

			sectionDiv.appendChild(document.createElement('br'));
		});

		container.appendChild(sectionDiv);
	}
}

/******************************************************************
 *		CALCULATE COCOMO RESULTS                              *
 ******************************************************************/
function calculateCocomo(event) {
	event.preventDefault();

	const selectedMode = document.querySelector('input[name="project-mode"]:checked').value;
	const sloc         = parseFloat(document.getElementById('sloc').value);

	if (isNaN(sloc) || sloc <= 0) {
		alert(isSpanish ? "Por favor, ingrese un valor válido para SLOC." : "Please enter a valid SLOC value.");
		return;
	}

	const coefficients = cocomoCoefficients[selectedMode];

	// Recopila los valores seleccionados de los inputs tipo radio
	const selectedValues = {};
	const inputs         = document.querySelectorAll('input[type="radio"]:checked');
	inputs.forEach(input => {
		const groupName = input.name;
		selectedValues[groupName] = input.value;
	});

	// Asigna pesos a los niveles y calcula un puntaje total
	const levelWeights   = { VL: 1, L: 2, N: 3, H: 4, VH: 5, XH: 6 };
	let attributeScore   = 0;

	for (const [key, value] of Object.entries(selectedValues)) {
		attributeScore += levelWeights[value] || 0;
	}

	// Calcula el esfuerzo, tiempo y tamaño del equipo
	const effort = coefficients.a * Math.pow(sloc / 1000, coefficients.b) * (1 + attributeScore / 100);  // Esfuerzo en persona-meses
	const time   = coefficients.c * Math.pow(effort, coefficients.d);  // Tiempo de desarrollo en meses
	const staff  = effort / time;  // Tamaño promedio del equipo

	lastCocomoResult = { selectedMode, effort, time, staff, attributeScore };  // Guarda el resultado para traducción

	renderCocomoResult();
}

/******************************************************************
 *		RENDER COCOMO RESULTS                                *
 ******************************************************************/
function renderCocomoResult() {
	if (!lastCocomoResult) return;

	const { selectedMode, effort, time, staff, attributeScore } = lastCocomoResult;

	const resultDiv = document.getElementById('cocomo-result');
	resultDiv.innerHTML = `
		<h3>${isSpanish ? "Resultados de COCOMO" : "COCOMO Results"}</h3>
		<p>${isSpanish ? "Modo" : "Mode"}: ${isSpanish ? translateMode(selectedMode) : selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}</p>
		<p>${isSpanish ? "Esfuerzo" : "Effort"}: ${effort.toFixed(2)} ${isSpanish ? "persona-meses" : "person-months"}</p>
		<p>${isSpanish ? "Tiempo de Desarrollo" : "Development Time"}: ${time.toFixed(2)} ${isSpanish ? "meses" : "months"}</p>
		<p>${isSpanish ? "Tamaño Promedio del Equipo" : "Average Staff Size"}: ${staff.toFixed(2)} ${isSpanish ? "personas" : "persons"}</p>
		<p>${isSpanish ? "Puntaje de Atributos" : "Attribute Score"}: ${attributeScore}</p>
	`;
}

/******************************************************************
 *		TRANSLATE PROJECT MODE TO SPANISH                      *
 ******************************************************************/
function translateMode(mode) {
	const modes = {
		organic: "Modo Orgánico",
		"semi-detached": "Modo Semi-desacoplado",
		embedded: "Modo Empotrado"
	};
	return modes[mode] || mode;
}

/******************************************************************
 *		TOGGLE ACRONYMS LEGEND VISIBILITY                     *
 ******************************************************************/
function toggleLegend() {
	const legendList = document.getElementById("legend-list");
	const legendIcon = document.getElementById("legend-icon");
	legendList.classList.toggle("hidden");
	legendIcon.textContent = legendList.classList.contains("hidden") ? "▼" : "▲";
}

/******************************************************************
 *		TRANSLATE KUTCHER'S CALCULATOR                        *
 ******************************************************************/
function translateKutcherCalculator() {
	document.getElementById("kutcher-calculator-title").textContent = isSpanish
		? "Calculadora Básica de COCOMO de Kutcher"
		: "Kutcher's Basic COCOMO Calculator!";
	document.getElementById("kutcher-calculator-description").textContent = isSpanish
		? "Ingrese el número estimado de líneas de código y la calculadora determinará cuánto tiempo y cuántas personas serán necesarias."
		: "Enter the number of estimated lines of code and the calculator will determine how much time and how many people will be needed!";
	document.getElementById("kutcher-sloc-label").textContent = isSpanish
		? "Miles de Líneas de Código Estimadas:"
		: "Thousands of Lines of Estimated Code:";
	document.getElementById("organic-title").textContent = isSpanish
		? "Valores Orgánicos"
		: "Organic Values";
	document.getElementById("semi-detached-title").textContent = isSpanish
		? "Valores Semi-desacoplados"
		: "SemiDetached Values";
	document.getElementById("embedded-title").textContent = isSpanish
		? "Valores Empotrados"
		: "Embedded Values";

	// Traduce los textos de resultados
	const monthsText = isSpanish ? "Número de Meses Necesarios:" : "Number of Months Needed:";
	const peopleText = isSpanish ? "Número de Personas Necesarias:" : "Number of People Needed:";
	document.querySelectorAll("#kutcher-cocomo-result p").forEach((p, index) => {
		if (index % 2 === 0) {
			p.childNodes[0].nodeValue = monthsText + " ";
		} else {
			p.childNodes[0].nodeValue = peopleText + " ";
		}
	});
}

/******************************************************************
 *		TOGGLE LANGUAGE BETWEEN ENGLISH & SPANISH              *
 ******************************************************************/
function toggleLanguage() {
	isSpanish = !isSpanish;

	// Actualiza el texto del formulario
	document.getElementById("form-title").textContent = isSpanish ? "Seleccionar Modo de Proyecto" : "Select Project Mode";
	document.getElementById("sloc-label").textContent = isSpanish ? "SLOC Estimado (Líneas de Código Fuente):" : "Estimated SLOC (Source Lines of Code)";
	document.getElementById("calculate-cocomo").textContent = isSpanish ? "Calcular COCOMO" : "Calculate COCOMO";

	// Actualiza los modos de proyecto
	const projectModes = document.getElementById("project-modes");
	projectModes.innerHTML = isSpanish
		? `
			<label>
				<input type="radio" name="project-mode" value="organic" checked> Modo Orgánico
			</label>
			<label>
				<input type="radio" name="project-mode" value="semi-detached"> Modo Semi-desacoplado
			</label>
			<label>
				<input type="radio" name="project-mode" value="embedded"> Modo Empotrado
			</label>
		`
		: `
			<label>
				<input type="radio" name="project-mode" value="organic" checked> Organic Mode
			</label>
			<label>
				<input type="radio" name="project-mode" value="semi-detached"> Semi-detached Mode
			</label>
			<label>
				<input type="radio" name="project-mode" value="embedded"> Embedded Mode
			</label>
		`;

	// Actualiza los atributos
	createAttributeSection("attributes-container", isSpanish ? attributesEs : attributes);

	// Actualiza el título y la lista de abreviaciones
	const legendTitle = document.getElementById("legend-title");
	legendTitle.childNodes[0].nodeValue = isSpanish ? "Abreviaciones Usadas " : "Acronyms Used ";
	document.getElementById("legend-list").innerHTML = isSpanish
		? `
			<li><strong>MB</strong>: Muy Bajo</li>
			<li><strong>B</strong>: Bajo</li>
			<li><strong>N</strong>: Nominal</li>
			<li><strong>A</strong>: Alto</li>
			<li><strong>MA</strong>: Muy Alto</li>
			<li><strong>EA</strong>: Extra Alto</li>
		`
		: `
			<li><strong>VL</strong>: Very Low</li>
			<li><strong>L</strong>: Low</li>
			<li><strong>N</strong>: Nominal</li>
			<li><strong>H</strong>: High</li>
			<li><strong>VH</strong>: Very High</li>
			<li><strong>XH</strong>: eXtra High</li>
		`;

	// Actualiza el texto del botón de idioma
	document.getElementById("toggle-language").textContent = isSpanish ? "Switch to English" : "Cambiar a Español";

	// Vuelve a renderizar los resultados de COCOMO en el idioma seleccionado
	renderCocomoResult();

	// Traduce la sección de Kutcher's Basic COCOMO Calculator
	translateKutcherCalculator();
}

/******************************************************************
 *		TOGGLE THEME (LIGHT / DARK)                           *
 ******************************************************************/
function toggleTheme() {
	const body        = document.body;
	const themeButton = document.getElementById("toggle-theme");

	body.classList.toggle("dark-mode");

	if (body.classList.contains("dark-mode")) {
		themeButton.textContent = "Modo Claro";
	} else {
		themeButton.textContent = "Modo Oscuro";
	}
}

/******************************************************************
 *		APPLY SYSTEM THEME ON PAGE LOAD                      *
 ******************************************************************/
function applySystemTheme() {
	const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const body            = document.body;
	const themeButton     = document.getElementById("toggle-theme");

	if (prefersDarkMode) {
		body.classList.add("dark-mode");
		themeButton.textContent = "Modo Claro";
	} else {
		body.classList.remove("dark-mode");
		themeButton.textContent = "Modo Oscuro";
	}

	// Aplica el tema a la sección de Kutcher's Basic COCOMO Calculator
	const kutcherCalculator = document.getElementById("kutcher-cocomo-calculator");
	if (prefersDarkMode) {
		kutcherCalculator.classList.add("dark-mode");
	} else {
		kutcherCalculator.classList.remove("dark-mode");
	}
}

// Detecta el tema del sistema al cargar
applySystemTheme();

// Agrega un listener para cambios en el tema del sistema
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applySystemTheme);

// Agrega eventos a los botones y elementos interactivos
document.getElementById("toggle-language").addEventListener("click", toggleLanguage);
document.getElementById("calculate-cocomo").addEventListener("click", calculateCocomo);
document.getElementById("toggle-theme").addEventListener("click", toggleTheme);

// Crea las secciones de atributos al cargar la página
createAttributeSection("attributes-container", attributes);

/******************************************************************
 *		CALCULATE KUTCHER'S BASIC COCOMO CALCULATOR            *
 ******************************************************************/
function calculateKutcherCocomo() {
	const kloc = parseFloat(document.getElementById('kutcher-sloc').value);

	if (isNaN(kloc) || kloc <= 0) {
		alert(isSpanish ? "Por favor, ingrese un valor válido para KLOC." : "Please enter a valid KLOC value.");
		return;
	}

	// Función para calcular meses y personas
	function calculateValues(a, b, c, d) {
		const effort = a * Math.pow(kloc, b); // Esfuerzo en persona-meses
		const time   = c * Math.pow(effort, d); // Tiempo en meses
		const people = effort / time;          // Personas necesarias
		return { time: time.toFixed(2), people: people.toFixed(2) };
	}

	// Cálculos para cada modo
	const organic      = calculateValues(2.4, 1.05, 2.5, 0.38);
	const semiDetached = calculateValues(3.0, 1.12, 2.5, 0.35);
	const embedded     = calculateValues(3.6, 1.20, 2.5, 0.32);

	// Actualiza los resultados en la interfaz
	document.getElementById('organic-months').textContent      = organic.time;
	document.getElementById('organic-people').textContent      = organic.people;
	document.getElementById('semi-detached-months').textContent = semiDetached.time;
	document.getElementById('semi-detached-people').textContent = semiDetached.people;
	document.getElementById('embedded-months').textContent      = embedded.time;
	document.getElementById('embedded-people').textContent      = embedded.people;
}

// Agrega el evento al botón de cálculo de Kutcher's Basic COCOMO
document.getElementById("calculate-kutcher-cocomo").addEventListener("click", calculateKutcherCocomo);

/******************************************************************
 *		TOGGLE KUTCHER'S CALCULATOR VISIBILITY                 *
 ******************************************************************/
function toggleKutcherCalculator() {
	const kutcherCalculator = document.getElementById("kutcher-cocomo-calculator");
	kutcherCalculator.classList.toggle("active");
}

// Agrega el evento al enlace del menú para Kutcher's Calculator
document.querySelector('a[href="#kutcher-cocomo-calculator"]').addEventListener("click", (event) => {
	event.preventDefault();
	toggleKutcherCalculator();
});
