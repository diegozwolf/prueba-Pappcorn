window.onload = startApp;
var usersForm; //se crea una variable global para el formulario
var refUsers; //variable para usar la base de datos de firebase
var userRows; //variable para mostrar datos en a tabla
var CREATE = "Guardar";
var UPDATE = "Modificar";
var mode = CREATE;
var refUserToEdit;

function startApp(){
	//se guarda el formulario en una variable
	usersForm = document.getElementById("users-form");

	//botones de navegación
	next = document.getElementById("next");
	next.addEventListener("click", goNext, false);
	back = document.getElementById("back");
	back.addEventListener("click", goBackward, false);

	// se crea un evento con el boton de submit para enviar info a firebase
	usersForm.addEventListener("submit", sendInfoFirebase, false);
	userRows = document.getElementById("user-rows");
	//referencia del nodo raiz de la base de datos.
	refUsers = firebase.database().ref().child("users");
	var options = {
		pageSize: 10,
		finite: true
	};
	console.log('hola')
	paginator = new FirebasePaginator(refUsers, options);
	showUsersInFirebase();
}

function goNext() {
	paginator.next()
	.then(function() {
		console.log('paginated forward');
		 showUsersInFirebase();
	});
}
function goBackward() {
	paginator.previous()
	.then(function() {
		console.log('paginated backward');
		showUsersInFirebase();
	});
}


//leer información de los usuarios en firebase
function showUsersInFirebase(){
	paginator.on("value", function(snap){
		var info = paginator.collection
		var rowsToShow = "";
		var lineNumber = 1
		//generar filas en la tabla
		for(var key in info){
			rowsToShow += `<tr>
								<th scope="row">${lineNumber}</th>
								<td>${key}</td>
								<td><span class='flag-icon flag-icon-${info[key].userCountry}'></span></td>
								<td>${info[key].userName}</td>
								<td>${info[key].userSports}</td>
								<td>${info[key].userAge}</td>
								<td>
									<button class="btn btn-danger delete" data-target="#form-window" user-data="${key}">
										<span class="glyphicon glyphicon-trash"></span>'
									</button>
								</td>
								<td>
									<button class="btn btn-success edit" data-toggle="modal" data-target="#form-window" user-data="${key}">
										<span class="glyphicon glyphicon-pencil"></span>
									</button>
								</td>
						  </tr>`;
			lineNumber += 1
		}
		// seleccionar elementos paraactivar la función de borrar en firebase
		userRows.innerHTML = rowsToShow;
		if(rowsToShow != ""){
			var elementsToDelete = document.getElementsByClassName("delete");
			for(var i= 0; i< elementsToDelete.length; i++){
				elementsToDelete[i].addEventListener("click", deleteUserFromFirebase, false);
			}
			var elementsToEdit = document.getElementsByClassName("edit");
			for(var i= 0; i< elementsToEdit.length; i++){
				elementsToEdit[i].addEventListener("click", editUserFromFirebase);
			}
		}
	});

}

// función para editar usuario
function editUserFromFirebase(){
	var userKeyToEdit = this.getAttribute("user-data");
	refUserToEdit = refUsers.child(userKeyToEdit);
	refUserToEdit.once("value", function(snap){
		var info = snap.val();
		document.getElementById("user-id").innerHTML = snap.getKey();
		document.getElementById("user-country").value = info.userCountry;
		document.getElementById("user-name").value = info.userName;
		document.getElementById("user-sports").value = info.userSports;
		document.getElementById("user-age").value = info.userAge;
	});
	document.getElementById("save-user").value = UPDATE;
	mode = UPDATE;
}

//Función bara borrar usuario
function deleteUserFromFirebase(){
	var userKeyToDelete = this.getAttribute("user-data");
	var refUserToDelete = refUsers.child(userKeyToDelete);
	confirm('¿Seguro Quiere borrar los datos?');	
	 refUserToDelete.remove().then(function() {
	 	paginator.reset().then(function () {
	 		return paginator.goToPage(1);
	 	});
  });
}


//función para enviar los datos del formulario a firebase
function sendInfoFirebase(event){
	event.preventDefault();
	switch(mode){
		case CREATE:
			refUsers.push({
				userCountry: event.target.userCountry.value,
				userName: event.target.userName.value,
				userSports: event.target.userSports.value,
				userAge: event.target.userAge.value
			});
			 
		break;
		case UPDATE:

			refUserToEdit.update({
				userCountry: event.target.userCountry.value,
				userName: event.target.userName.value,
				userSports: event.target.userSports.value,
				userAge: event.target.userAge.value
			});
			mode = CREATE;
			document.getElementById("save-user").value = CREATE;

		break;		
	}
	 paginator.reset().then(function () {
			   return paginator.goToPage(1);
		 });

	
}

//hacer reset en el formulario después de modificar
    $('#form-window').on('hidden.bs.modal', function (event) {
        document.getElementById("users-form").reset()
    });

    $("#form-window").on( "click", function() {
    	document.getElementById("user-id").innerHTML = "";   	
	});
