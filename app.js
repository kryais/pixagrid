var form = document.getElementById('project-form');
var nameInput = document.getElementById('project-name');
var size = document.getElementById('size');
var widthInput = document.getElementById('width');
var heightInput = document.getElementById('height');
var customSize = document.getElementById('custom-size');
var canvas = document.getElementById('canvas');
var statusText = document.getElementById('status');
var undo = document.getElementById('undo');
var redo = document.getElementById('redo');
var stepText = document.getElementById('step');
var key = 'pixagrid-project';
var first = {
    nameInput: 'Untitled', size: '32', widthInput:'32', heightInput:'32',
    projectName: 'Untitled',width:32,height:32
};
var pHistory = [first];
var position = 0;
var saveError = false;

// keep teh project and its history together
function save(){
    try{
        localStorage.setItem(key, JSON.stringify({history:pHistory,position:position}));
        saveError = false;
    } catch (error){
        saveError = true;
    }
}
function validState(item){
    return item && typeof item.nameInput === 'string' && typeof item.widthInput === 'string' && typeof item.heightInput === 'string' && typeof item.projectName === 'string' && ['16','32','64','custom'].includes(item.size)&&
    Number.isInteger(item.width) && item.width >= 1 && item.width <= 128 &&
    Number.isInteger(item.height) && item.height >= 1 && item.height <=128;
}
function load(){
    try{
        var data = JSON.parse(localStorage.getItem(key) || 'null');
        var good = data && Array.isArray(data.history) && data.history.length > 0 &&
        data.history.every(validState) && Number.isInteger(data.position) &&
        data.position >= 0 && data.position < data.history.length;
        good && (pHistory = data.history, position = data.position);
    } catch (error){
        console.log('Could not load the saved project. Starting fresh.');
    }
}
function show(){
    var state = pHistory[position];
    //avoid moving the cursor while typing
    nameInput.value !== state.nameInput && (nameInput.value = state.nameInput);
    size.value !== state.size && (size.value = state.size);
    widthInput.value !== state.widthInput && (widthInput.value = state.widthInput);
    heightInput.value !== state.heightInput && (heightInput.value = state.heightInput);
    customSize.hidden = state.size !== 'custom';
    canvas.width !== state.width && (canvas.width = state.width);
    canvas.height !== state.height && (canvas.height = state.height);
    canvas.style.width = Math.min(400, 400 * state.width / state.height) + 'px';
    document.getElementById('current-name').textContent = state.projectName;
    document.getElementById('current-size').textContent = state.width + ' × ' + state.height + ' pixels';
    undo.disabled = position === 0;
    redo.disabled = position === pHistory.length - 1;
    stepText.textContent = 'Step ' + position + ' / ' + (pHistory.length - 1);
    saveError && (statusText.textContent = 'Could not save in this browser. Changes may be lost on reload.');
}
function addStep(state){
    // dont add duplicate steps
    var changed = JSON.stringify(state) !== JSON.stringify(pHistory[position]);
    changed && (pHistory = pHistory.slice(0, position + 1), pHistory.push(state), position = pHistory.length - 1);
    save();
    show();
}
function readInputs(){
    var state = Object.assign({}, pHistory[position]);
    state.nameInput = nameInput.value;
    state.size = size.value;
    state.widthInput = widthInput.value;
    state.heightInput = heightInput.value;
    statusText.textContent = 'Project settings updated.';
    addStep(state);
}
nameInput.addEventListener('input',readInputs);
size.addEventListener('change',readInputs);
widthInput.addEventListener('input',readInputs);
heightInput.addEventListener('input',readInputs);

form.addEventListener('submit', function(event){
    event.preventDefault();
    var state = Object.assign({},pHistory[position]);
    var custom = size.value === 'custom';
    var width = Number([size.value, widthInput.value][Number(custom)]);
    var height = Number([size.value, heightInput.value][Number(custom)]);
    var valid = Number.isInteger(width) && Number.isInteger(height) && width >= 1 && height >= 1 && width <= 128 && height <= 128;
    [function (){
        statusText.textContent = 'Choose whole-number dimensions between 1 and 128.';
    }, function (){
        state.width = width;
        state.height = height;
        state.projectName=nameInput.value.trim() ||'Untitled';
        statusText.textContent = 'New blank project created.';
        addStep(state);
    }][Number(valid)]();
});
undo.addEventListener('click',function(){
    position = Math.max(0, position - 1);
    statusText.textContent = 'Undid the last change.';
    save();
    show();
});
redo.addEventListener('click',function(){
    position = Math.min(pHistory.length - 1, position + 1);
    statusText.textContent='Redid the change.';
    save();
    show();
});
load();
show();