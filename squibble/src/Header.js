import './Header.css';

function Header() {
  return (
    <div className="Header">
      <header className="App-header">
        <div className="App-logo">
          //img src="https://www.squibble.design/wp-content/uploads/2021/06/squibble-logo-1.png" alt="logo"
        </div>
        <div className="Timer">
            //add timer function application ad display it here
        </div>
        <button>Archive</button>
        //check for if logged in through firebase here later
        <div className="Signed In">
            //add user information here
            <button>Add Media</button>
            <button>Sign Out</button>
        </div>
        <button>Sign In</button> 
      </header>
    </div>
  );
}

export default Header;
