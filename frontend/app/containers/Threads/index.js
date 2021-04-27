/*
 * ThreadsPage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React, { useEffect, useState, memo } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'
import InfiniteScroll from 'react-infinite-scroller'
import { bindActionCreators, compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import ListGroup from 'react-bootstrap/ListGroup'

import ThreadListItem from '../../components/ThreadListItem'
import Breadcrumb from '../../components/Breadcrumb'

import { useInjectReducer } from '../../utils/injectReducer'
import { useInjectSaga } from '../../utils/injectSaga'
import H2 from '../../components/H2'

import {
  makeSelectThreadsList,
  // makeSelectLoading,
  // makeSelectError,
} from './selectors'

import {
  makeSelectTopic,
  // makeSelectLoading,
  // makeSelectError,
} from '../Topics/selectors'

import CenteredSection from './CenteredSection'
import Section from './Section'
import messages from './messages'
import * as threadsActionsCreator from './actions'
import * as topicsActionsCreator from '../Topics/actions'

import reducer from './reducer'
import saga from './saga'

import topicsReducer from '../Topics/reducer'
import topicsSaga from '../Topics/saga'

import history from '../../utils/apphistory'

const threadsKey = 'threads'
const topicsKey = 'topics'

export function ThreadsList({
  threadsActions,
  topicsActions,
  match,
  threadsList,
  topic,
  history: _history,
}) {
  useInjectReducer({ key: threadsKey, reducer })
  useInjectSaga({ key: threadsKey, saga })

  useInjectReducer({ key: topicsKey, reducer: topicsReducer })
  useInjectSaga({ key: topicsKey, saga: topicsSaga })

  const [threads, setThreads] = useState([])
  const [hasMoreItems, setHasMoreItems] = useState(false)
  const [nextHref, setNextHref] = useState(null)

  const breadcrumbSections = [
    {
      key: 'Topics',
      content: 'Topics',
      href: '/topics',
      // link: true,
      onClick: evt => {
        evt.preventDefault()
        history.push('/topics')
        if (_history) {
          // parent app history
          _history.push({ pathname: `/topics` })
        }
      },
    },
  ]

  useEffect(() => {
    topicsActions.loadTopic(match.params.topicSlug)
    // load threads from server
    threadsActions.loadThreads(match.params.topicSlug)

    return () => {
      // clear threads list while unmount
      threadsActions.threadsListLoaded(false)
    }
  }, [])

  const loadNextPage = () => {
    if (hasMoreItems) {
      // if we call next page setHasMore item false and waiting for a server response
      setHasMoreItems(Boolean(false))
      threadsActions.loadThreads(null, nextHref)
    }
  }

  const onThreadClick = (e, item) => {
    history.push(`/${topic.slug}/${item.id}/${item.slug}`)
    if (_history) {
      // parent app history
      _history.push({ pathname: `/${topic.slug}/${item.id}/${item.slug}` })
    }
  }

  useEffect(() => {
    if (threadsList) {
      setThreads([...threads, ...threadsList.results])
      setHasMoreItems(Boolean(threadsList.next))
      setNextHref(threadsList.next)
    }
  }, [threadsList])

  let items = []

  if (threads) {
    items = threads.map(item => (
      <ThreadListItem
        onClick={e => {
          onThreadClick(e, item)
        }}
        key={item.id}
        item={item}
      />
    ))
  }

  return (
    <article>
      <Helmet>
        {/* todo add titles */}
        <title>Threads List</title>
        <meta name="description" content="React comments Django threads List" />
      </Helmet>
      <Breadcrumb sections={breadcrumbSections} />
      <div>
        <CenteredSection>
          <H2>
            {topic && topic.title}
            {/* <FormattedMessage {...messages.threadsList} /> */}
          </H2>
        </CenteredSection>
        <Section>
          <InfiniteScroll
            pageStart={0}
            loadMore={loadNextPage}
            hasMore={hasMoreItems}
            // loader={<div key={this.state.nextHref} style={{clear: 'both'}} />} // fix https://github.com/CassetteRocks/react-infinite-scroller/issues/14#issuecomment-225835845
          >
            <ListGroup>{items}</ListGroup>
            {threadsList && threadsList.count === 0 && (
              <h4>There are no threads to show</h4>
            )}
          </InfiniteScroll>
        </Section>
      </div>
    </article>
  )
}

ThreadsList.propTypes = {
  threadsActions: PropTypes.shape({
    loadThreads: PropTypes.func.isRequired,
    threadsListLoaded: PropTypes.func.isRequired,
  }).isRequired,
  topicsActions: PropTypes.shape({
    loadTopic: PropTypes.func.isRequired,
  }).isRequired,
  match: PropTypes.object,
  threadsList: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
  topic: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]),
}

const mapStateToProps = createStructuredSelector({
  threadsList: makeSelectThreadsList(),
  topic: makeSelectTopic(),
  // username: makeSelectUsername(),
  // loading: makeSelectLoading(),
  // error: makeSelectError(),
})

export function mapDispatchToProps(dispatch) {
  return {
    threadsActions: bindActionCreators(threadsActionsCreator, dispatch),
    topicsActions: bindActionCreators(topicsActionsCreator, dispatch),
  }
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
)

export default compose(
  withConnect,
  memo,
)(ThreadsList)
