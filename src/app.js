import React, { PureComponent, Fragment } from 'react';
import ReactDOM from 'react-dom';
import feather from 'feather-icons';
import { login, getUsersInfo } from './facebook';
import 'bulma/css/bulma.css';

class ResultPage extends PureComponent {
  constructor() {
    super();

    this.state = {
      selected: null,
      shareList: [],
      fbAccessToken: null,
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

  handleGetAdditionalInfo = () => {
    const { fbAccessToken, shareList } = this.state;

    if (!fbAccessToken) {
      this.setState({
        fbAccessToken: login(),
      });

      return;
    }

    console.log(fbAccessToken);

    getUsersInfo(shareList.map(share => share.id).slice(0, 1), fbAccessToken);
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
            <div className="content">
              <a
                className="button is-link"
                onClick={this.handleGetAdditionalInfo}
              >
                Get addtional user information
              </a>
            </div>
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
