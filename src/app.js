import React, { PureComponent, Fragment } from 'react';
import ReactDOM from 'react-dom';
import feather from 'feather-icons';
import 'bulma/css/bulma.css';

const SHARE_PROPERTIES = ['name', 'profileLink', 'timestamp', 'postLink'];

class ResultPage extends PureComponent {
  constructor() {
    super();

    this.state = {
      selected: null,
      shareList: [],
    };
  }

  componentDidMount() {
    chrome.runtime.sendMessage(
      {
        type: 'GET_RESULT_SHARE_LIST',
      },
      response => {
        console.log(response);
        this.setState({
          shareList: response,
        });

        feather.replace();
      },
    );
  }

  handleSelectRow = postLink => {
    this.setState({
      selected: postLink,
    });
  };

  render() {
    const { shareList, selected } = this.state;

    const header = (
      <tr>
        <th>Index</th>
        <th>Name</th>
        <th>Content</th>
        <th>Posted time</th>
        <th>Post link</th>
      </tr>
    );

    const stickyStyle = {
      position: 'sticky',
      top: 0,
    };

    return (
      <Fragment>
        <section className="hero is-medium is-info is-bold">
          <div className="hero-body">
            <div className="container is-fluid">
              <h1 className="title">Get FB Share List</h1>
              <h2 className="subtitle">Result of the post</h2>
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container is-fluid">
            <table className="table is-striped is-hoverable is-fullwidth">
              <thead style={stickyStyle}>{header}</thead>
              <tfoot>{header}</tfoot>
              <tbody>
                {shareList.map((share, index) => (
                  <tr
                    key={share.postLink}
                    className={selected === share.postLink ? 'is-selected' : ''}
                    onClick={() => this.handleSelectRow(share.postLink)}
                  >
                    <th>{index + 1}</th>
                    <td>
                      <a target="_blank" href={share.profileLink}>
                        {share.name}
                      </a>
                    </td>
                    <td>{share.content}</td>
                    <td>{new Date(share.timestamp * 1000).toLocaleString()}</td>
                    <td>
                      <a
                        className="icon is-small"
                        style={{ verticalAlign: 'text-bottom' }}
                        target="_blank"
                        href={`https://www.facebook.com${share.postLink}`}
                      >
                        <i data-feather="external-link" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </Fragment>
    );
  }
}

ReactDOM.render(<ResultPage />, document.getElementById('root'));
