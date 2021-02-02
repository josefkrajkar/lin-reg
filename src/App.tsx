import * as  React from 'react';
import axios from 'axios';

interface State {
  maxX: number;
  maxY: number;
}

function App() {

  React.useEffect(() => {
    axios.get('https://storage.googleapis.com/tfjs-tutorials/carsData.json')
    .then(({data}) => {
      console.log(data);
      let maxX = 0;
      let maxY = 0;

      data.forEach((item: any) => {
        maxY = item.Weight_in_lbs >= maxY ? item.Weight_in_lbs : maxY;
        maxX = item.Miles_per_Gallon >= maxX ? item.Miles_per_Gallon : maxX;
      });

      setState((actState: State) => ({
        ...actState,
        maxX: Math.floor(maxX + (maxX / 10)),
        maxY: Math.floor(maxY + (maxY / 10))
      }))
    })
    .catch(err => {
      console.error(err.message);
    });
  }, []);

  const [state, setState] = React.useState({
    maxX: 100,
    maxY: 100
  });

  return (
    <div style={{
      width: '800px',
      height: '600px',
      background: '#ececec',
      boxShadow: '5px 5px 5px 0 grey',
      margin: '25px',
      display: 'flex',
      flexFlow: 'row',
      padding: '20px'
    }}>
      <div
        style={{
          flex: '0 0 50px',
          display: 'flex',
          flexFlow: 'column'
        }}
      >
        <div
          style={{
            flex: '1 1 auto',
            borderBottom: '1px solid black',
            display: 'flex',
            flexFlow: 'column'
          }}
        >
          <div style={{
            flex: '0 0 auto',
            margin: '5px 5px auto auto'
          }}>
            {state.maxY}
          </div>

        </div>
        <div
          style={{
            flex: '0 0 50px',
            display: 'flex',
          }}
        >

          <div
            style={{
              flex: '0 0 auto',
              margin: '5px 5px auto auto',
            }}
          >
            0
          </div>

        </div>
      </div>
      <div
        style={{
          flex: '1 1 auto',
          display: 'flex',
          flexFlow: 'column'
        }}
      >
        <div
          style={{
            flex: '1 1 auto',
            borderBottom: '1px solid black',
            borderLeft: '1px solid black',
            position: 'relative'
          }}
        >

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
            id='my-div'
          >

          </div>
          <div
            style={{
              position: 'absolute',
              top: '38px',
              left: '-35px',
              transform: 'rotate(90deg)'
            }}
          >
            Weight in lbs
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0
            }}
          >
            Miles per Gallon
          </div>

        </div>
        <div
          style={{
            flex: '0 0 50px',
            borderLeft: '1px solid black',
            display: 'flex'
          }}
        >

          <div style={{
            flex: '0 0 auto',
            margin: '5px 5px auto auto'
          }}>
            {
              state.maxX
            }
          </div>

        </div>
      </div>
      
    </div>
  );
}

export default App;
