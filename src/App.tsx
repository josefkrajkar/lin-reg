import * as  React from 'react';
import axios from 'axios';
import * as tf from '@tensorflow/tfjs';

interface State {
  maxX: number;
  maxY: number;
  data: Array<{
    x: number;
    y: number;
  }>;
  prediction: Array<{
    x: number;
    y: number;
  }>;
  model?: tf.ModelTensorInfo;
}

function App() {

  const createModel = () => {
    const model = tf.sequential();
    model.add(tf.layers.dense({inputShape: [1], units: 1}));
    model.add(tf.layers.dense({units: 512, activation: 'relu'}));
    model.add(tf.layers.dense({units: 256, activation: 'relu'}));
    model.add(tf.layers.dense({units: 1}));
    return model;
  };

  const convertToTensor = (data: Array<{x: number, y: number}>) => {
    return tf.tidy(() => {
      tf.util.shuffle(data);
      const inputs = data.map(d => d.x);
      const labels = data.map(d => d.y);

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin));
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin));

      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        inputMax,
        inputMin,
        labelMax,
        labelMin
      }
    })
  };

  const train = async (model: any, inputs: any, labels: any) => {
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });

    const batchSize = 32;
    const epochs = 50;

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true
    })
  };

  const testModel = (model: any, inputData: any, normalizationData: any) => {
    const {inputMax, inputMin, labelMin, labelMax} = normalizationData;

    const [xs, preds] = tf.tidy(() => {
      const xs = tf.linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1]));
      const unNormXs = xs
        .mul(inputMax.sub(inputMin))
        .add(inputMin);
      const unNormPreds = preds
        .mul(labelMax.sub(labelMin))
        .add(labelMin);
      
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });

    const predictedPoints = Array.from(xs).map((val, i) => {
      return {x: val, y: preds[i]}
    });

    return predictedPoints;
  };


  const [state, setState] = React.useState<State>({
    maxX: 100,
    maxY: 100,
    data: [],
    model: undefined,
    prediction: []
  });

  React.useEffect(() => {
    const model = createModel();

    axios.get('https://storage.googleapis.com/tfjs-tutorials/carsData.json')
      .then(({data}) => {
        console.log(data[0]);
        const filtered: Array<{x: number, y: number}> = data
          .filter((item: any) => (item.Weight_in_lbs !== null && item.Miles_per_Gallon !== null))
          .map((item: any) => ({
            x: item.Miles_per_Gallon,
            y: item.Weight_in_lbs
          }))
        let maxX = 0;
        let maxY = 0;

        filtered.forEach((item: any) => {
          maxY = item.y >= maxY ? item.y : maxY;
          maxX = item.x >= maxX ? item.x : maxX;
        });

        const tensorData = convertToTensor(filtered);
        const {inputs, labels} = tensorData;
        train(model, inputs, labels)
        .then((result) => {
          setState((actState: State) => ({
            ...actState,
            maxX: Math.floor(maxX + (maxX / 10)),
            maxY: Math.floor(maxY + (maxY / 10)),
            data: filtered,
            model,
            prediction: testModel(model, data, tensorData)
          }))
        })
        .catch((err) => {
          console.error(err);
        });
      })
      .catch(err => {
        console.error(err.message);
      });
  }, []);

  return (
    <div style={{
      width: 'calc(100vw - 40px)',
      height: 'calc(100vh - 40px)',
      background: '#ececec',
      boxShadow: '5px 5px 5px 0 grey',
      // margin: '25px',
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
          flexFlow: 'column',
          position: 'relative'
        }}
        id='my-canvas'
      >
        {
          state.data.map((item: any, key: number) => {
            const element = document.getElementById('my-canvas');
            if (element) {
              const rect = element.getBoundingClientRect()
              return <svg
                key={key}
                style={{
                  bottom: ((rect.height / state.maxY) * item.y) + 3,
                  left: ((rect.width / state.maxX) * item.x) + 3,
                  position: 'absolute'
                }}
                width={rect.height / 100}
                height={rect.height / 100}
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <ellipse ry={rect.height / 200} rx={rect.height / 200} id="svg_1" cy={rect.height / 200} cx={rect.height / 200} strokeWidth="1" fill="#84D3DB"/>
                </g>
              </svg>
            }
            return null
          })
        }

        {
          state.prediction.map((item: any, key: number) => {
            const element = document.getElementById('my-canvas');
            if (element) {
              const rect = element.getBoundingClientRect()
              return <svg
                key={key}
                style={{
                  bottom: ((rect.height / state.maxY) * item.y) + 3,
                  left: ((rect.width / state.maxX) * item.x) + 3,
                  position: 'absolute'
                }}
                width={rect.height / 100}
                height={rect.height / 100}
                xmlns="http://www.w3.org/2000/svg"
              >
                <g>
                  <ellipse ry={rect.height / 200} rx={rect.height / 200} id="svg_1" cy={rect.height / 200} cx={rect.height / 200} strokeWidth="1" fill="red"/>
                </g>
              </svg>
            }
            return null
          })
        }

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
            Weight_in_lbs
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
