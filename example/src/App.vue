<template>
  <div id="app">
    <div class="example">
      <p>
        <button @click="detectAddressByIP">Где я</button>
        <template v-if="detectionResult">
          <span>{{ detectionResult.location ? detectionResult.location.data.city : 'я ваще хз' }}</span>
        </template>
      </p>

      <vue-suggest class="asdad"
        v-model="type"
        :list="['address', 'fio', 'party', 'email', 'bank']"
        :maxCount="10"
        :minLength="0"
        :debounce="200"
        :filterByQuery="true"
        ref="suggestComponent1"
        placeholder="Choose type">
      </vue-suggest>

      <br>

      <vue-suggest class="asdad"
        v-model="model"
        :list="getList"
        :maxCount="10"
        :minLength="3"
        :debounce="200"
        :filterByQuery="false"
        :controls="{
          selectionUp: [38, 33],
          selectionDown: [40, 34],
          select: [13, 36],
          hideList: [27, 35],
          autocomplete: [32, 13]
        }"
        ref="suggestComponent"
        :placeholder="`Search ${type || 'address'}...`"
        :valueAttribute="valAttr"
        displayAttribute="value"
        @select="onSuggestSelect"
        @hover="onSuggestHover"
        @focus="onFocus"
        @blur="onBlur"
        @requestStart="onRequestStart"
        @requestDone="onRequestDone"
        @requestFailed="onRequestFailed"
        @showList="onShowList"
        @hideList="onHideList">
        <!-- <input type="text"> -->

        <!-- <div class="g"><input type="text"></div> -->

        <template slot="miscItem-above" slot-scope="{ suggestions, query }" v-if="suggestions.length > 0">
          <div class="misc-item">
            <span>You're searching for '{{ query }}'.</span>
          </div>
          <div class="misc-item">
            <span>{{ suggestions.length }} suggestions are shown...</span>
          </div>
          <hr>
        </template>

        <div slot="suggestionItem" slot-scope="scope">
          <span v-html="boldenSuggestion(scope)"></span>
        </div>

        <div class="misc-item" slot="miscItem-below" slot-scope="{ suggestions }" v-if="loading">
          <span>Loading...</span>
        </div>
      </vue-suggest>

      <p v-if="selected">Selected element: <pre v-html="selected" class="selected"></pre></p>
    </div>
    <div class="log-container">
      <p class="title">
        Event Log: (<a href="#clear" @click.prevent="log.splice(0)">clear</a>)
      </p>
      <div class="log" ref="log">
        <p v-for="(text, i) in log" :key="'p' + i" :ref="'p' + i"><pre v-html="text"></pre></p>
      </div>
    </div>
  </div>
</template>

<script>
  import VueSuggest from 'vue-simple-suggest'
  import DadataClient from 'dadata-js'

  const DADATA_API_KEY = '278908b74c6a3a5433aaec7c7364a38420722c05'
  const client = new DadataClient(DADATA_API_KEY);

  export default {
    components: {
      VueSuggest
    },
    name: 'app',
    data () {
      return {
        selected: null,
        model: '',
        loading: false,
        log: [],
        client,
        type: null,
        detectionResult: null
      }
    },
    computed: {
      valAttr () {
        switch (this.type || 'address') {
          case 'address':
          return 'data.fias_id'
          break

          case 'party':
          return 'data.hid'
          break

          case 'fio':
          return 'value'
          break

          case 'email':
          return 'value'
          break

          case 'bank':
          return 'data.name.full'
          break
        }
      }
    },
    methods: {
      boldenSuggestion({ suggestion, query }) {
        let result = this.$refs.suggestComponent.displayProperty(suggestion);

        if (!query) return result;

        const replace = str => (result = result.replace(str, str.bold()));
        const texts = query.split(/[\s-_/\\|\.]/gm).filter(t => !!t) || [''];
        const procs = [
          s => s[0].toUpperCase() + s.substr(1),
          s => s.toLowerCase(),
          s => s.toUpperCase(),
          s => s
        ];

        texts.forEach(t => procs.forEach(p => replace(p(t))));
        return result;
      },
      addToLog (name, e) {
        this.log.push(name)
        console.log(name, e);
        this.$nextTick(() => {
          this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
        })
      },
      onFocus (e) {
        this.addToLog('focus', e)
      },
      onBlur (e) {
        this.addToLog('blur', e)
      },
      onRequestStart (value) {
        this.addToLog('requestStart', value)
      },
      onRequestDone (e) {
        this.addToLog('requestDone', e)
      },
      onRequestFailed (e) {
        this.addToLog('requestFailed', e)
      },
      onShowList (e) {
        this.addToLog('showList', e)
      },
      onHideList (e) {
        this.addToLog('hideList', e)
      },
      onSuggestSelect (suggest) {
        this.addToLog('select', suggest)
        this.selected = suggest
      },
      onSuggestHover (suggestion) {
        this.addToLog('hover', suggestion);
      },
      getList (inputValue) {
        return this.client.suggest(this.type || 'address', inputValue)
      },

      async detectAddressByIP () {
        this.detectionResult = await this.client.detectAddressByIP()
      }
    }
  }
</script>

<style>
  #app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin: 60px auto 0;
    width: 800px;
    height: 448px;
    display: flex;
  }

  #app .log-container .title {
    position: sticky;
  }

  #app .example {
    width: 506px;
  }

  #app .example,
  #app .log-container,
  #app .log {
    padding: 0 16px;
  }

  #app .log-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-width: 230px;
    max-width: 230px;
  }

  #app .log {
    height: 100%;
    border-radius: 3px;
    border: 1px solid #aaa;
    text-align: right;
    overflow-x: hidden;
    overflow-y: scroll;
  }

  #app .log pre {
    white-space: pre-wrap;
    word-break: break-all;
  }

  #app pre.selected {
    width: 506px;
    height: 295px;
    overflow-x: scroll;
    overflow-y: scroll;
  }
</style>
