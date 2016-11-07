var displayName = document.getElementById('displayName');
var todosContainer = document.getElementById('todos-container');
var loading =document.getElementById('loading');
var currentUID;
var currentUser;
function create(){
  if (typeof currentUser === 'undefined') return;
  var todoText = document.getElementById('todo-text').value;
  createTodo(currentUID, currentUser.displayName, currentUser.photoURL, todoText);
}

function createTodo(uid, username, picture, todo) {
  if (typeof currentUser === 'undefined') return;
  // A post entry.
  var todoData = {
    author: username,
    uid: uid,
    todo: todo,
    authorPic: picture
  };

  // Get a key for a new Post.
  var newTodoKey = firebase.database().ref().child('todo').push().key;

  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/todo/' + newTodoKey] = todoData;

  return firebase.database().ref().update(updates);
}

function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}

function onAuthStateChanged(user) {
  if (user && currentUID === user.uid) {
    return;
  }

  if (user) {
    currentUser = user;
    currentUID = user.uid;
    displayName.textContent = user.displayName;
    writeUserData(user.uid, user.displayName, user.email, user.photoURL);
    startDatabaseQueries();
  } else {
  }
}

function startDatabaseQueries() {
  var myUserId = firebase.auth().currentUser.uid;
  var recentPostsRef = firebase.database().ref('todo').limitToLast(100);
    var fetchPosts = function(postsRef) {
    postsRef.on('child_added', function(data) {
      var author = data.val().author || 'Anonymous';
      var todoItem = data.val();
      todosContainer.insertBefore(createTodoElement(data.key, todoItem.todo, todoItem.author, todoItem.uid, todoItem.authorPic), todosContainer.firstChild);
      loading.classList.remove('show');
    });
    postsRef.on('child_changed', function(data) { 
    });
    postsRef.on('child_removed', function(data) {
    });
  };
  fetchPosts(recentPostsRef);
}
function createTodoElement(id, todo, author, authorId, authorPic) {
  var uid = firebase.auth().currentUser.uid;

  var html = 
  '<div class="todo-item">'+
    //'<span>'+author+'</span>'+
    '<span>'+
      '<img src="'+authorPic+'" width=15 height=15/>'+
    '</span>'+
    '<span>'+todo+'</span>'+
  '</div>';

  // Create the DOM element from the HTML.
  var div = document.createElement('div');
  div.innerHTML = html;
  var todoElement = div.firstChild;
  return todoElement;
}
window.addEventListener('load', function() {
  firebase.auth().onAuthStateChanged(onAuthStateChanged);
});