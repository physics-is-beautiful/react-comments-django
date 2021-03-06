/*
 * TopicsPage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, useState, memo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'
import { useRouteMatch } from 'react-router-dom'
import { bindActionCreators, compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import ListGroup from 'react-bootstrap/ListGroup'
import TopicListItem from 'components/TopicListItem'
import H2 from 'components/H2'

import { useInjectReducer } from '../../utils/injectReducer'
import { useInjectSaga } from '../../utils/injectSaga'

import {
  makeSelectTopicsList,
  // makeSelectLoading,
  // makeSelectError,
} from './selectors'

import CenteredSection from './CenteredSection'
import Section from './Section'
import messages from './messages'
import * as loadTopicsActionsCreator from './actions'

import reducer from './reducer'
import saga from './saga'
// todo migrate to :
//  import { useHistory } from 'react-router-dom';
import history from '../../utils/apphistory'

const key = 'topics'

export function TopicsList({
  topicListActions,
  topicsList,
  history: _history,
}) {
  useInjectReducer({ key, reducer })
  useInjectSaga({ key, saga })

  const match = useRouteMatch()

  const [topics, setTopics] = useState([])
  const [hasMoreItems, setHasMoreItems] = useState(false)
  const [nextHref, setNextHref] = useState(null)

  useEffect(() => {
    // refresh topics from server
    topicListActions.loadTopics()

    return () => {
      // clear topics list while unmount
      topicListActions.topicsListLoaded(false)
    }
  }, [])

  const loadNextPage = () => {
    if (hasMoreItems) {
      // if we call next page setHasMore item false and waiting for a server response
      setHasMoreItems(Boolean(false))
      topicListActions.loadTopics(nextHref)
    }
  }

  const onTopicClick = (e, slug) => {
    let baseName = ''
    if (_history) {
      baseName = _history.createHref({ pathname: '' }).slice(0, -1)
      // inside history do not know about external history basename, so add this
    }
    // console.log(baseName)
    // console.log(match.path)

    history.push(`${baseName}${match.path}/${slug}`)
    // must be after history.push
    if (_history) {
      // parent app history, we need to replace internal history page to exclude
      // internal url from history
      _history.replace({ pathname: `${match.path}/${slug}` })
    }
  }

  useEffect(() => {
    if (topicsList) {
      setTopics([...topics, ...topicsList.results])
      setHasMoreItems(Boolean(topicsList.next))
      setNextHref(topicsList.next)
    }
  }, [topicsList])

  let items = []

  if (topics) {
    items = topics.map(item => (
      <TopicListItem
        onClick={e => {
          onTopicClick(e, item.slug)
        }}
        key={item.slug}
        item={item}
      />
    ))
  }

  // console.log('topics loaded')

  return (
    <article>
      <Helmet>
        <title>Topics List</title>
        <meta name="description" content="React comments Django topics List" />
      </Helmet>
      <div>
        <CenteredSection>
          <H2>
            <FormattedMessage {...messages.topicsList} />
          </H2>
        </CenteredSection>
        <Section>
          {/* <List selection celled> */}
          {/* {topicsList && */}
          {/* topicsList.results.map(item => ( */}
          {/* <TopicListItem key={item.slug} item={item} /> */}
          {/* ))} */}
          {/* </List> */}
          <InfiniteScroll
            pageStart={0}
            loadMore={loadNextPage}
            hasMore={hasMoreItems}
            // loader={<div key={this.state.nextHref} style={{clear: 'both'}} />} // fix https://github.com/CassetteRocks/react-infinite-scroller/issues/14#issuecomment-225835845
          >
            <ListGroup>{items}</ListGroup>
          </InfiniteScroll>
        </Section>
      </div>
    </article>
  )
}

TopicsList.propTypes = {
  topicListActions: PropTypes.shape({
    loadTopics: PropTypes.func.isRequired,
    topicsListLoaded: PropTypes.func.isRequired,
  }).isRequired,
  topicsList: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
}

const mapStateToProps = createStructuredSelector({
  topicsList: makeSelectTopicsList(),
  // username: makeSelectUsername(),
  // loading: makeSelectLoading(),
  // error: makeSelectError(),
})

export function mapDispatchToProps(dispatch) {
  return {
    topicListActions: bindActionCreators(loadTopicsActionsCreator, dispatch),
  }
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)

export default compose(
  withConnect,
  memo,
)(TopicsList)
