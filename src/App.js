import { Octokit } from "octokit";
import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { RotatingLines } from "react-loader-spinner";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.min.css'

function b64DecodeUnicode(str) {
  return decodeURIComponent(atob(str).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
      function toSolidBytes(match, p1) {
          return String.fromCharCode('0x' + p1);
  }));
}

function App() {
  const [state, setState] = useState(null)
  const [sha, setSha] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const octokit = new Octokit({ 
    auth: process.env.REACT_APP_GITHUB_TOKEN,
  });
  
  const onLoad = useCallback(async () => {
    await octokit.request("GET /octocat", {})
    await octokit.request('GET /repos/{owner}/{repo}/contents/list.json', {
      owner: 'patricksprenger',
      repo: 'patricksprenger.github.io',
      path: 'blob/main/list.json',
      headers: {
        'If-None-Match': ''
      },
    }).then(res => {
          const encoded = res.data.content;
          const decoded = JSON.parse(b64DecodeUnicode(encoded));
          setState(decoded)
          setSha(res.data.sha)
    }).catch(err => console.log('err', err)); 
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []) 

useEffect(() => {
  onLoad()
}, [onLoad])

async function updateFile(updatedList) {
  try {
    const contentEncoded = b64EncodeUnicode(JSON.stringify(updatedList))
    const data = await octokit.rest.repos.createOrUpdateFileContents({
    owner: "patricksprenger",
    repo: "patricksprenger.github.io",
    path: "list.json",
    message: "feat: Updated file programatically",
    sha: sha,
    content: contentEncoded,
      committer: {
        name: `Patrick Sprenger`,
        email: "patricktrindade9@gmail.com",
      },
      author: {
        name: "Octokit Bot",
        email: "patricktrindade9@gmail.com",
      },
    });
  } catch (error) {
    console.log(error)
  }
}

  function handleCheck(position, checked) {
    const newArray = [...state]
    newArray[position].quantity = !checked ? newArray[position].quantity - 1 : newArray[position].quantity + 1
    newArray[position].checked = !checked
    setState(newArray)
  }

  function updateSuccess() {
    setIsLoading(false)
    toast.success('Opção salva. Obrigada(o)!', {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
      });
  }

  function handleUpdate() {
    const stateToSend = state.map((gift) => {
      return {
        "item": gift.item,
        "quantity": gift.quantity,
        "checked": gift.quantity === 0 ? true : false
      }
    })
    setIsLoading(true)
    updateFile(stateToSend)
    setTimeout(() => updateSuccess(), 5000)
  }

  function Input({ gift, index }) {
    return (
      <div className="list">
        <input type="checkbox" checked={gift.checked} className="input" onChange={() => handleCheck(index, gift.checked)}/>
        <p className={gift.checked && 'nameChecked'}>{gift.item}</p>
      </div>
    )
  }

  return (
    <>
      {isLoading ? (
        <div className="loader">
          <RotatingLines
            strokeColor="grey"
            strokeWidth="5"
            animationDuration="0.75"
            width="96"
            visible={true}
         />
        </div>
      ) : (
        <>
          <ToastContainer />
          <div className="header">
            <img className="img" src="https://images.creativemarket.com/0.1.0/ps/7424024/1820/1213/m1/fpnw/wm1/ffzblzstga22qqc5ybvuyrxpju94awstdhrlqq0wfsbuocevbesnc17upfdp6xow-.jpg?1575663214&s=bb273e1b77d3758f29d618072cb5a295" alt="background"/>
            <p className="title">Chá de bebê</p>
          </div>
          <div className="App-header">
            <div className='main'>
              {state?.map((item, index) => 
                <Input gift={item} index={index} />
                )}
            </div>
            <button className="btn" onClick={handleUpdate}>Salvar</button>
          </div>
        </>
      )}
    </>
  );
}

export default App;

