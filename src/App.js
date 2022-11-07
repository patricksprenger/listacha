import { Octokit } from "octokit";
import './App.css';
import { useCallback, useEffect, useState } from 'react';
import { RotatingLines } from "react-loader-spinner";

function App() {
  const [state, setState] = useState(null)
  const [sha, setSha] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  console.log(process.env.REACT_APP_GITHUB_TOKEN, 'TOKENENENEN')
  
  const octokit = new Octokit({ 
    auth: process.env.REACT_APP_GITHUB_TOKEN,
  });
  
  const onLoad = useCallback(async () => {
    await octokit.request("GET /octocat", {})
    console.log(octokit, 'métodos')
    await octokit.request('GET /repos/{owner}/{repo}/contents/list.json', {
      owner: 'patricksprenger',
      repo: 'patricksprenger.github.io',
      path: 'blob/main/list.json',
      headers: {
        'If-None-Match': ''
      }
    }).then(res => {
          const encoded = res.data.content;
          const decoded = JSON.parse(atob(encoded));
          setState(decoded)
          setSha(res.data.sha)
          console.log('decoded', decoded)
          // setCode(decoded);
    }).catch(err => console.log('err', err)); 
}, []) 

useEffect(() => {
  onLoad()
}, [onLoad])

async function updateFile(updatedList) {
  console.log(sha, 'shaaaaaaa')
  try {
    const contentEncoded = btoa(JSON.stringify(updatedList));
    const data = await octokit.rest.repos.createOrUpdateFileContents({
    // replace the owner and email with your own details
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
    console.log(data)
  } catch (error) {
    console.log(error)
  }
}

//  console.log(token)  // updateFile()

  function handleCheck(position, checked) {
    const newArray = [...state]
    newArray[position].checked = !checked
    setState(newArray)
  }

  function handleUpdate() {
    setIsLoading(true)
    updateFile(state)
    setTimeout(() => setIsLoading(false), 7000)
  }

  console.log(isLoading, 'loading')

  function Input({ gift, index }) {
    console.log(gift, index);
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
        <RotatingLines
          strokeColor="grey"
          strokeWidth="5"
          animationDuration="0.75"
          width="96"
          visible={true}
       />
      ) : (
        <>
          <button className="btn" onClick={handleUpdate}>SALVAR</button>
          <div className="App-header">
            <div className='main'>
              {state?.map((item, index) => 
                <Input gift={item} index={index} />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default App;

