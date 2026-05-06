function hireEmployee(){
    if(game.money<500) return notify("Sin dinero");

    game.money-=500;
    game.employees.push({speed:0.5});

    notify("Empleado contratado");
    renderEmployees();
}

function renderEmployees(){
    employeesContent.innerHTML=`
    <div class="panel">
        Empleados: ${game.employees.length}
        <button onclick="hireEmployee()">Contratar</button>
    </div>`;
}"